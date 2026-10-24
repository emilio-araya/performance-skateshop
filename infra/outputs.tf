output "public_ip" {
  description = "Fixed public IP of the web server."
  value       = aws_eip.web.public_ip
}

output "url" {
  description = "Address of the published store."
  value       = "http://${aws_eip.web.public_ip}"
}

output "ssh_command" {
  description = "Command to open a shell on the server."
  value       = "ssh ubuntu@${aws_eip.web.public_ip}"
}
