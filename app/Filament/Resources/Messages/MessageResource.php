<?php

namespace App\Filament\Resources\Messages;

use App\Filament\Resources\Messages\Pages\ManageMessages;
use App\Models\Message;
use BackedEnum;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Actions\Action;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Mail;
use App\Mail\ContactReplyMailable;

class MessageResource extends Resource
{
    protected static ?string $model = Message::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedEnvelope;

    protected static ?string $navigationLabel = 'Pesan Masuk';

    protected static ?string $pluralModelLabel = 'Pesan Masuk';

    protected static ?string $modelLabel = 'Pesan';

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required(),
                TextInput::make('email')
                    ->label('Email address')
                    ->email()
                    ->required(),
                TextInput::make('subject'),
                Textarea::make('message')
                    ->required()
                    ->columnSpanFull(),
                Toggle::make('is_read')
                    ->required(),
            ]);
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('name'),
                TextEntry::make('email')
                    ->label('Email address'),
                TextEntry::make('subject')
                    ->placeholder('-'),
                TextEntry::make('is_read')
                    ->label('Sudah Dibaca')
                    ->badge()
                    ->color(fn ($state) => $state ? 'success' : 'warning')
                    ->formatStateUsing(fn ($state) => $state ? 'Sudah' : 'Belum'),
                TextEntry::make('message')
                    ->label('Pesan')
                    ->columnSpanFull(),
                TextEntry::make('reply_content')
                    ->label('Isi Balasan')
                    ->placeholder('Belum dibalas')
                    ->columnSpanFull(),
                TextEntry::make('replied_at')
                    ->label('Tanggal Dibalas')
                    ->dateTime()
                    ->placeholder('-'),
                TextEntry::make('created_at')
                    ->label('Diterima Pada')
                    ->dateTime(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('name')
            ->columns([
                TextColumn::make('name')
                    ->searchable(),
                TextColumn::make('email')
                    ->label('Email address')
                    ->searchable(),
                TextColumn::make('subject')
                    ->searchable(),
                IconColumn::make('is_read')
                    ->label('Sudah Dibaca')
                    ->boolean(),
                TextColumn::make('replied_at')
                    ->label('Dibalas Pada')
                    ->dateTime()
                    ->sortable()
                    ->placeholder('Belum dibalas'),
                TextColumn::make('created_at')
                    ->label('Diterima Pada')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                ViewAction::make(),
                Action::make('reply')
                    ->label('Balas')
                    ->icon(Heroicon::OutlinedChatBubbleLeftRight)
                    ->color('success')
                    ->form([
                        TextInput::make('subject')
                            ->label('Subjek Email')
                            ->required()
                            ->default(fn ($record) => 'Balasan: ' . ($record->subject ?: 'Pesan Anda')),
                        Textarea::make('reply_content')
                            ->label('Isi Balasan')
                            ->rows(6)
                            ->required(),
                    ])
                    ->action(function ($record, array $data) {
                        // 1. Send the email using Laravel Mailer
                        Mail::to($record->email)->send(new ContactReplyMailable(
                            originalName: $record->name,
                            originalSubject: $record->subject,
                            originalMessage: $record->message,
                            replyContent: $data['reply_content']
                        ));

                        // 2. Save reply to DB and mark as read
                        $record->update([
                            'reply_content' => $data['reply_content'],
                            'replied_at' => now(),
                            'is_read' => true,
                        ]);
                    })
                    ->visible(fn ($record) => $record->replied_at === null),
                Action::make('reply_mailto')
                    ->label('Balas via Email Client')
                    ->icon(Heroicon::OutlinedEnvelope)
                    ->color('gray')
                    ->url(fn ($record) => 'mailto:' . $record->email . '?subject=' . rawurlencode('Re: ' . ($record->subject ?: 'Pesan Anda')) . '&body=' . rawurlencode("\n\n---\nPesan Asli Anda:\n> " . $record->message))
                    ->openUrlInNewTab(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ManageMessages::route('/'),
        ];
    }
}
