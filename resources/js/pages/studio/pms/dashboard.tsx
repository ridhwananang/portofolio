import { Head, usePage } from '@inertiajs/react';
import React from 'react';
import { resolvePrimaryPortalProject } from '@/components/studio/pms/cockpit/client-portal-link-button';
import { CockpitBottomBento } from '@/components/studio/pms/cockpit/cockpit-bottom-bento';
import { CockpitHeroBanner } from '@/components/studio/pms/cockpit/cockpit-hero-banner';
import { CockpitMetricConstellation } from '@/components/studio/pms/cockpit/cockpit-metric-constellation';
import { ProjectHealthGrid } from '@/components/studio/pms/cockpit/project-health-grid';
import AppLayout from '@/layouts/app-layout';
import type { Auth } from '@/types';
import type {
    PmsCockpitSprint,
    PmsCockpitTask,
    PmsProjectHealth,
    PmsStats,
} from '@/types/pms';

interface Props {
    is_admin?: boolean;
    stats: PmsStats;
    projectHealth: PmsProjectHealth[];
    upcomingDeadlines: PmsCockpitTask[];
    actionableTasks?: PmsCockpitTask[];
    activeSprints?: PmsCockpitSprint[];
}

export default function PmsDashboard({
    is_admin,
    stats,
    projectHealth = [],
    upcomingDeadlines = [],
    actionableTasks = [],
    activeSprints = [],
}: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const isAdmin = is_admin ?? Boolean(auth?.user?.is_admin);
    const primaryPortalProject = resolvePrimaryPortalProject(projectHealth);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Studio', href: isAdmin ? '/studio' : '/studio/pms' },
                { title: 'Project Management System (PMS)', href: '/studio/pms' },
            ]}
        >
            <Head title="PMS Executive Cockpit - Studio Workspace" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
                <CockpitHeroBanner
                    isAdmin={isAdmin}
                    primaryPortalProject={primaryPortalProject}
                />

                <CockpitMetricConstellation stats={stats} isAdmin={isAdmin} />

                <ProjectHealthGrid projectHealth={projectHealth} isAdmin={isAdmin} />

                <CockpitBottomBento
                    stats={stats}
                    upcomingDeadlines={upcomingDeadlines}
                    actionableTasks={actionableTasks}
                    activeSprints={activeSprints}
                />
            </div>
        </AppLayout>
    );
}
