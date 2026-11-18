import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

/**
 * Resolves the absolute URL of the public web portfolio.
 * When on a subdomain (e.g. studio.ridhwananang.id or studio.portofolio.test),
 * it strips the subdomain prefix to target the root domain (https://ridhwananang.id).
 */
export function resolvePublicWebUrl(explicitUrl?: string | null, path = ''): string {
    const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';

    if (explicitUrl && explicitUrl !== '/') {
        return `${explicitUrl.replace(/\/+$/, '')}${cleanPath}`;
    }

    if (typeof window !== 'undefined' && window.location) {
        const { hostname, protocol, port } = window.location;
        const portSuffix = port && port !== '80' && port !== '443' ? `:${port}` : '';

        // If on studio.* or admin.* subdomain, target root apex domain
        if (hostname.startsWith('studio.')) {
            return `${protocol}//${hostname.slice(7)}${portSuffix}${cleanPath}`;
        }

        if (hostname.startsWith('admin.')) {
            return `${protocol}//${hostname.slice(6)}${portSuffix}${cleanPath}`;
        }

        return `${protocol}//${hostname}${portSuffix}${cleanPath}`;
    }

    const defaultBase = (explicitUrl || 'https://ridhwananang.id').replace(/\/+$/, '');

    return `${defaultBase}${cleanPath}`;
}
