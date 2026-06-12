<?php
print_r(\App\Models\Certificate::pluck('file_path')->toArray());
