import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Message, Project, ProjectOrder } from '@/types';
import { FluidMetricConstellation } from '@/components/admin/dashboard/fluid-metric-constellation';
import { OpenOrderStream } from '@/components/admin/dashboard/open-order-stream';
import { FluidDispatchStream } from '@/components/admin/dashboard/fluid-dispatch-stream';
import { FluidShowcaseMosaic } from '@/components/admin/dashboard/fluid-showcase-mosaic';

interface DashboardProps {
    metrics: {
        totalProjects: number;
        totalCertificates: number;
        totalTechStacks: number;
        totalMessages: number;
        unreadMessages: number;
        totalOrders: number;
    };
    recentMessages: Message[];
    recentProjects: Project[];
    recentOrders: ProjectOrder[];
}

export default function AdminDashboard({
    metrics,
    recentMessages = [],
    recentProjects = [],
    recentOrders = [],
}: DashboardProps) {
    // Calculate total order value
    const totalOrderValue = recentOrders.reduce(
        (sum, ord) => sum + (Number(ord.total_amount) || 0),
        0
    );

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Studio', href: '/admin' },
                { title: 'Spatial Workspace', href: '/admin' },
            ]}
        >
            <Head title="Studio Workspace - Ridhwan Anang" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-10">
                {/* 1. Floating Metric Constellation (No outer box!) */}
                <FluidMetricConstellation
                    metrics={metrics}
                    totalOrderValue={totalOrderValue}
                />

                {/* 2. Open Order Stream (No outer box!) */}
                <OpenOrderStream
                    orders={recentOrders}
                    totalOrders={metrics.totalOrders}
                />

                {/* 3. Open Dual Stream: Client Inquiries & Showcase Mosaic */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                    {/* Left Stream (6 cols): Client Inbound Feed */}
                    <div className="lg:col-span-6">
                        <FluidDispatchStream
                            messages={recentMessages}
                            unreadCount={metrics.unreadMessages}
                        />
                    </div>

                    {/* Right Stream (6 cols): Showcase Mosaic & Floating Seal */}
                    <div className="lg:col-span-6">
                        <FluidShowcaseMosaic
                            projects={recentProjects}
                            totalProjects={metrics.totalProjects}
                            totalCertificates={metrics.totalCertificates}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
