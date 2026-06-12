<?php

foreach (\App\Models\Project::all() as $p) {
    if (str_ends_with($p->image, '.png')) {
        $p->image = str_replace('.png', '.webp', $p->image);
        $p->save();
        echo "Updated project image: {$p->title} -> {$p->image}\n";
    }
}

$profile = \App\Models\Profile::first();
if ($profile) {
    if (str_ends_with($profile->image, '.jpeg')) {
        $profile->image = str_replace('.jpeg', '.webp', $profile->image);
        $profile->save();
        echo "Updated profile image: {$profile->name} -> {$profile->image}\n";
    }
}
