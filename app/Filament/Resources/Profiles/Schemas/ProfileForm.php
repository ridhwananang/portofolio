<?php

namespace App\Filament\Resources\Profiles\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Repeater;
use Filament\Schemas\Schema;

class ProfileForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required(),
                TextInput::make('role')
                    ->required(),
                Textarea::make('bio')
                    ->required()
                    ->columnSpanFull(),
                TextInput::make('location')
                    ->required(),
                TextInput::make('email')
                    ->label('Email address')
                    ->email()
                    ->required(),
                FileUpload::make('image')
                    ->image()
                    ->disk('public'),
                TextInput::make('github_url')
                    ->url(),
                TextInput::make('linkedin_url')
                    ->url(),
                Repeater::make('education')
                    ->label('Riwayat Pendidikan')
                    ->schema([
                        TextInput::make('school')
                            ->label('Nama Sekolah/Universitas')
                            ->required(),
                        TextInput::make('major')
                            ->label('Jurusan/Fakultas'),
                        TextInput::make('period')
                            ->label('Tahun / Periode'),
                    ])
                    ->columnSpanFull(),
            ]);
    }
}
