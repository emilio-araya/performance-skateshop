#!/usr/bin/env bash
# Builds the React app and publishes dist/ to the EC2 created by Terraform.
# Usage (from the project root): ./infra/deploy.sh
# Optional: SSH_KEY=/path/to/private_key ./infra/deploy.sh
set -euo pipefail

cd "$(dirname "$0")/.."

SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519}"

# The security group only allows SSH from one CIDR, and home connections are
# usually dynamic. Before connecting, allow the current public IP and keep the
# rule as narrow as a single address (/32). Never widen it to a larger range.
permitir_ssh_desde_ip_actual() {
    local ip_publica cidr tfvars="infra/terraform.tfvars"

    if ! ip_publica="$(curl -fsS -m 10 https://checkip.amazonaws.com)"; then
        echo "WARNING: could not read the public IP; keeping the current SSH rule." >&2
        return
    fi
    ip_publica="${ip_publica//[[:space:]]/}"

    if [[ ! "$ip_publica" =~ ^[0-9]{1,3}(\.[0-9]{1,3}){3}$ ]]; then
        echo "WARNING: unexpected public IP '${ip_publica}'; keeping the current SSH rule." >&2
        return
    fi

    cidr="${ip_publica}/32"
    echo "==> Allowing SSH from ${cidr}"
    terraform -chdir=infra apply -input=false -auto-approve -no-color \
        -var="ssh_allowed_cidr=${cidr}" >/dev/null

    # Keep the file in sync, so a later `terraform plan` without -var agrees.
    if [ -f "$tfvars" ] && grep -q '^ssh_allowed_cidr' "$tfvars"; then
        sed -i "s|^ssh_allowed_cidr = .*|ssh_allowed_cidr = \"${cidr}\"|" "$tfvars"
    fi
}

permitir_ssh_desde_ip_actual

IP="$(terraform -chdir=infra output -raw public_ip)"
DESTINO="ubuntu@${IP}"
SSH_OPTS=(-i "$SSH_KEY" -o StrictHostKeyChecking=accept-new -o ConnectTimeout=5)

echo "==> Building the app"
npm run build

# nginx starts as soon as apt installs it, before user_data finishes. Waiting
# for cloud-init avoids uploading the app and then having user_data overwrite
# it with the placeholder page.
echo "==> Waiting for the first boot of ${IP} to finish (can take a few minutes)"
listo=false
for _ in $(seq 1 30); do
    if ssh "${SSH_OPTS[@]}" "$DESTINO" 'cloud-init status --wait >/dev/null'; then
        listo=true
        break
    fi
    sleep 10
done
if [ "$listo" != true ]; then
    echo "ERROR: ${IP} did not finish booting. Check the instance in the AWS console." >&2
    exit 1
fi

echo "==> Uploading dist/"
# Replace the previous release completely, then stream the new one over SSH.
ssh "${SSH_OPTS[@]}" "$DESTINO" 'find /var/www/eva2 -mindepth 1 -delete'
tar -C dist -cf - . | ssh "${SSH_OPTS[@]}" "$DESTINO" 'tar -C /var/www/eva2 -xf -'

echo "==> Checking the published page"
if curl -fsS "http://${IP}/" | cmp -s - dist/index.html; then
    echo "==> Published: http://${IP}"
else
    echo "ERROR: http://${IP}/ does not serve the new build." >&2
    exit 1
fi
