<?php

namespace App\Filament\Resources\TechStacks\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class TechStackForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required(),
                Textarea::make('description')
                    ->required()
                    ->columnSpanFull(),
                TextInput::make('badge')
                    ->required(),
                TextInput::make('color')
                    ->required(),
                TextInput::make('text_color')
                    ->required(),
                TextInput::make('accent')
                    ->required(),
                TextInput::make('icon_name')
                    ->required(),
            ]);
    }
}
