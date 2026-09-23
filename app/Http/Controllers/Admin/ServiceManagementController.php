<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceAddon;
use App\Models\ServicePackage;
use App\Models\ServiceSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ServiceManagementController extends Controller
{
    public function index(): Response
    {
        $packages = ServicePackage::query()->orderBy('sort_order')->orderBy('id')->get();
        $addons = ServiceAddon::query()->orderBy('sort_order')->orderBy('id')->get();
        
        $settings = ServiceSetting::all()->pluck('value', 'key')->toArray();
        if (empty($settings['express_multiplier'])) {
            $settings['express_multiplier'] = '1.20';
        }
        if (empty($settings['consultation_phone'])) {
            $settings['consultation_phone'] = '6281284567890';
        }
        if (empty($settings['guarantee_badge_text'])) {
            $settings['guarantee_badge_text'] = '100% Garansi Rekening Bersama Midtrans Escrow';
        }
        if (empty($settings['default_dp_percentage'])) {
            $settings['default_dp_percentage'] = '50';
        }

        return Inertia::render('admin/services/index', [
            'packages' => $packages,
            'addons' => $addons,
            'settings' => $settings,
        ]);
    }

    public function storePackage(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:100'],
            'slug' => ['nullable', 'string', 'max:64', 'unique:service_packages,slug'],
            'description' => ['nullable', 'string', 'max:500'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'timeline' => ['required', 'string', 'max:50'],
            'icon' => ['required', 'string', 'max:50'],
            'is_popular' => ['boolean'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
            'features_included' => ['nullable', 'array'],
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title'], '_');
        }

        ServicePackage::create($validated);

        return back()->with('success', 'Paket layanan baru berhasil ditambahkan.');
    }

    public function updatePackage(Request $request, ServicePackage $package): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:100'],
            'slug' => ['required', 'string', 'max:64', 'unique:service_packages,slug,' . $package->id],
            'description' => ['nullable', 'string', 'max:500'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'timeline' => ['required', 'string', 'max:50'],
            'icon' => ['required', 'string', 'max:50'],
            'is_popular' => ['boolean'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
            'features_included' => ['nullable', 'array'],
        ]);

        $package->update($validated);

        return back()->with('success', 'Paket layanan berhasil diperbarui.');
    }

    public function togglePackage(ServicePackage $package): RedirectResponse
    {
        $package->update(['is_active' => ! $package->is_active]);

        $statusStr = $package->is_active ? 'diaktifkan' : 'dinonaktifkan';
        return back()->with('success', "Paket {$package->title} berhasil {$statusStr}.");
    }

    public function destroyPackage(ServicePackage $package): RedirectResponse
    {
        $title = $package->title;
        $package->delete();

        return back()->with('success', "Paket {$title} berhasil dihapus.");
    }

    public function storeAddon(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['nullable', 'string', 'max:64', 'unique:service_addons,slug'],
            'description' => ['nullable', 'string', 'max:500'],
            'price' => ['required', 'numeric', 'min:0'],
            'icon' => ['required', 'string', 'max:50'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name'], '_');
        }

        ServiceAddon::create($validated);

        return back()->with('success', 'Fitur add-on baru berhasil ditambahkan.');
    }

    public function updateAddon(Request $request, ServiceAddon $addon): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['required', 'string', 'max:64', 'unique:service_addons,slug,' . $addon->id],
            'description' => ['nullable', 'string', 'max:500'],
            'price' => ['required', 'numeric', 'min:0'],
            'icon' => ['required', 'string', 'max:50'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ]);

        $addon->update($validated);

        return back()->with('success', 'Fitur add-on berhasil diperbarui.');
    }

    public function toggleAddon(ServiceAddon $addon): RedirectResponse
    {
        $addon->update(['is_active' => ! $addon->is_active]);

        $statusStr = $addon->is_active ? 'diaktifkan' : 'dinonaktifkan';
        return back()->with('success', "Add-on {$addon->name} berhasil {$statusStr}.");
    }

    public function destroyAddon(ServiceAddon $addon): RedirectResponse
    {
        $name = $addon->name;
        $addon->delete();

        return back()->with('success', "Add-on {$name} berhasil dihapus.");
    }

    public function updateSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'express_multiplier' => ['required', 'numeric', 'min:1', 'max:3'],
            'consultation_phone' => ['required', 'string', 'max:30'],
            'guarantee_badge_text' => ['required', 'string', 'max:255'],
            'default_dp_percentage' => ['sometimes', 'nullable', 'numeric', 'min:10', 'max:100'],
        ]);

        foreach ($validated as $key => $val) {
            if ($val !== null) {
                ServiceSetting::setVal($key, (string) $val);
            }
        }

        return back()->with('success', 'Pengaturan global layanan berhasil disimpan.');
    }
}
