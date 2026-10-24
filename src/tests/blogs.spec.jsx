import { it, expect, describe } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { BLOGS_DATA } from '../Pages/Store/Blogs';

describe('blog posts from fase 1', () => {
    it('keeps the four articles of the original project', () => {
        expect(BLOGS_DATA).toHaveLength(4);
    });

    it('points every article at an image that exists in public/img', () => {
        const missing = BLOGS_DATA
            .map((blog) => blog.img)
            .filter((img) => !existsSync(resolve(process.cwd(), 'public', img.slice(1))));

        expect(missing).toEqual([]);
    });

    it('uses an id that the detail route can resolve', () => {
        const ids = BLOGS_DATA.map((blog) => blog.id);

        expect(new Set(ids).size).toBe(ids.length);
        expect(ids).toEqual([1, 2, 3, 4]);
    });
});
