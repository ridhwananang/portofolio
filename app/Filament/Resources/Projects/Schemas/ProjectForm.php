<?php

namespace App\Filament\Resources\Projects\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TagsInput;
use Filament\Schemas\Schema;

class ProjectForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('title')
                    ->required(),
                Textarea::make('description')
                    ->required()
                    ->columnSpanFull(),
                TagsInput::make('tags')
                    ->required()
                    ->columnSpanFull(),
                TextInput::make('mockup_type')
                    ->required(),
                FileUpload::make('image')
                    ->image()
                    ->disk('public'),
            ]);
    }
}
