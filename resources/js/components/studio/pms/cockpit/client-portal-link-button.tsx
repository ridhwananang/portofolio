import { ExternalLink, Globe } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PmsProjectHealth } from '@/types/pms';

/**
 * Resolve public Client Portal URL when a project's portal is active.
 */
export function getPortalHref(project?: PmsProjectHealth | null): string | null {
    if (!project?.portal_token || project.is_portal_active === false) {
        return null;
    }

    return `/portal/${project.portal_token}`;
}

/**
 * Pick the primary project that has an active public Client Portal link.
 */
export function resolvePrimaryPortalProject(projects: PmsProjectHealth[]): PmsProjectHealth | null {
    return projects.find((project) => getPortalHref(project) !== null) ?? null;
}

interface ClientPortalLinkButtonProps {
    project?: PmsProjectHealth | null;
    isAdmin: boolean;
    size?: 'default' | 'sm';
    label?: string;
    className?: string;
}

/**
 * Direct Client Portal shortcut rendered exclusively for non-admin PMS Cockpit members.
 */
export function ClientPortalLinkButton({
    project,
    isAdmin,
    size = 'sm',
    label = 'Portal Klien',
    className,
}: ClientPortalLinkButtonProps) {
    if (isAdmin) {
        return null;
    }

    const portalHref = getPortalHref(project);

    if (!portalHref || !project) {
        return null;
    }

    return (
        <Button
            asChild
            size={size}
            variant="outline"
            className={cn(
                'rounded-xl border-cyan-500/35 bg-cyan-500/10 text-cyan-700 hover:bg-cyan-500/15 hover:text-cyan-800 dark:border-cyan-400/30 dark:bg-cyan-500/15 dark:text-cyan-200 dark:hover:bg-cyan-500/25 font-semibold shadow-sm shadow-cyan-500/5 transition-colors',
                className,
            )}
        >
            <a
                href={portalHref}
                target="_blank"
                rel="noopener noreferrer"
                title={`Buka Portal Klien: ${project.name}`}
            >
                <Globe className="size-3.5 text-cyan-600 dark:text-cyan-300" />
                <span>{label}</span>
                <ExternalLink className="size-3 opacity-75" />
            </a>
        </Button>
    );
}
