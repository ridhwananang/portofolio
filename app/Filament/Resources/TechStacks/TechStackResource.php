<?php

namespace App\Filament\Resources\TechStacks;

use App\Filament\Resources\TechStacks\Pages\CreateTechStack;
use App\Filament\Resources\TechStacks\Pages\EditTechStack;
use App\Filament\Resources\TechStacks\Pages\ListTechStacks;
use App\Filament\Resources\TechStacks\Schemas\TechStackForm;
use App\Filament\Resources\TechStacks\Tables\TechStacksTable;
use App\Models\TechStack;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class TechStackResource extends Resource
{
    protected static ?string $model = TechStack::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCpuChip;

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return TechStackForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return TechStacksTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListTechStacks::route('/'),
            'create' => CreateTechStack::route('/create'),
            'edit' => EditTechStack::route('/{record}/edit'),
        ];
    }
}
