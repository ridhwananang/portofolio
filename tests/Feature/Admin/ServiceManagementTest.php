<?php

use App\Models\ServiceAddon;
use App\Models\ServicePackage;
use App\Models\ServiceSetting;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->create(['is_admin' => true]);
    $this->user = User::factory()->create(['is_admin' => false]);
});

test('non admin cannot access admin services management', function () {
    $response = $this->actingAs($this->user)->get(route('admin.services.index'));
    $response->assertForbidden();
});

test('admin can view services management page', function () {
    $response = $this->actingAs($this->admin)->get(route('admin.services.index'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/services/index')
        ->has('packages')
        ->has('addons')
        ->has('settings')
    );
});

test('admin can create a new service package', function () {
    $response = $this->actingAs($this->admin)->post(route('admin.services.packages.store'), [
        'title' => 'Mobile App Integration',
        'slug' => 'mobile_app_integration',
        'description' => 'Integrasi API Flutter dan React Native.',
        'base_price' => 750000,
        'timeline' => '2-3 minggu',
        'icon' => 'laptop',
        'is_popular' => true,
        'is_active' => true,
        'sort_order' => 10,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');
    $this->assertDatabaseHas('service_packages', [
        'slug' => 'mobile_app_integration',
        'title' => 'Mobile App Integration',
        'base_price' => 750000,
    ]);
});

test('admin can update a service package', function () {
    $package = ServicePackage::create([
        'title' => 'Initial Title',
        'slug' => 'initial_title',
        'base_price' => 200000,
        'timeline' => '1 minggu',
        'icon' => 'globe',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $response = $this->actingAs($this->admin)->put(route('admin.services.packages.update', $package), [
        'title' => 'Updated Title',
        'slug' => 'initial_title',
        'description' => 'Updated Description',
        'base_price' => 250000,
        'timeline' => '2 minggu',
        'icon' => 'zap',
        'is_popular' => false,
        'is_active' => true,
        'sort_order' => 2,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');
    $this->assertDatabaseHas('service_packages', [
        'id' => $package->id,
        'title' => 'Updated Title',
        'base_price' => 250000,
    ]);
});

test('admin can toggle package active status', function () {
    $package = ServicePackage::create([
        'title' => 'Toggle Package',
        'slug' => 'toggle_package',
        'base_price' => 300000,
        'timeline' => '1 minggu',
        'icon' => 'globe',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $response = $this->actingAs($this->admin)->patch(route('admin.services.packages.toggle', $package));
    $response->assertRedirect();
    $response->assertSessionHas('success');
    expect($package->fresh()->is_active)->toBeFalse();

    $response = $this->actingAs($this->admin)->patch(route('admin.services.packages.toggle', $package));
    $response->assertRedirect();
    $response->assertSessionHas('success');
    expect($package->fresh()->is_active)->toBeTrue();
});

test('admin can delete a service package', function () {
    $package = ServicePackage::create([
        'title' => 'Delete Package',
        'slug' => 'delete_package',
        'base_price' => 300000,
        'timeline' => '1 minggu',
        'icon' => 'globe',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $response = $this->actingAs($this->admin)->delete(route('admin.services.packages.destroy', $package));
    $response->assertRedirect();
    $response->assertSessionHas('success');
    $this->assertDatabaseMissing('service_packages', ['id' => $package->id]);
});

test('admin can create and manage service addons', function () {
    $response = $this->actingAs($this->admin)->post(route('admin.services.addons.store'), [
        'name' => 'Redis Caching & CDN',
        'slug' => 'redis_cdn',
        'description' => 'Percepat loading website hingga 300%.',
        'price' => 60000,
        'icon' => 'zap',
        'is_active' => true,
        'sort_order' => 5,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');
    $this->assertDatabaseHas('service_addons', [
        'slug' => 'redis_cdn',
        'name' => 'Redis Caching & CDN',
        'price' => 60000,
    ]);

    $addon = ServiceAddon::where('slug', 'redis_cdn')->first();

    // Toggle
    $this->actingAs($this->admin)->patch(route('admin.services.addons.toggle', $addon));
    expect($addon->fresh()->is_active)->toBeFalse();

    // Delete
    $this->actingAs($this->admin)->delete(route('admin.services.addons.destroy', $addon));
    $this->assertDatabaseMissing('service_addons', ['id' => $addon->id]);
});

test('admin can update global service settings', function () {
    $response = $this->actingAs($this->admin)->post(route('admin.services.settings.update'), [
        'express_multiplier' => '1.25',
        'consultation_phone' => '6281234567890',
        'guarantee_badge_text' => 'Garansi 100% Kepuasan & Rekber Resmi',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    expect(ServiceSetting::getVal('express_multiplier'))->toBe('1.25')
        ->and(ServiceSetting::getVal('consultation_phone'))->toBe('6281234567890')
        ->and(ServiceSetting::getVal('guarantee_badge_text'))->toBe('Garansi 100% Kepuasan & Rekber Resmi');
});

test('public services calculator loads active dynamic packages and addons', function () {
    $package = ServicePackage::create([
        'title' => 'VIP Corporate Portal',
        'slug' => 'vip_corporate',
        'base_price' => 1200000,
        'timeline' => '1 bulan',
        'icon' => 'rocket',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $response = $this->get(route('services.calculator'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('services-calculator')
        ->has('initialPackages')
        ->has('initialAddons')
        ->has('initialSettings')
    );
});
