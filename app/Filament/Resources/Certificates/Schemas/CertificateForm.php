<?php

namespace App\Filament\Resources\Certificates\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\TagsInput;
use Filament\Schemas\Schema;

class CertificateForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('title')
                    ->required(),
                TextInput::make('category')
                    ->required(),
                TextInput::make('issuer')
                    ->required()
                    ->default('Dicoding Indonesia'),
                TextInput::make('credential_id'),
                TextInput::make('date')
                    ->required(),
                TextInput::make('duration')
                    ->required(),
                TagsInput::make('skills')
                    ->required()
                    ->columnSpanFull(),
                FileUpload::make('file_path')
                    ->required()
                    ->directory('certificates')
                    ->disk('public')
                    ->acceptedFileTypes(['application/pdf', 'image/*'])
                    ->columnSpanFull(),
            ]);
    }
}
