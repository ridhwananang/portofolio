$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $docPath = "C:\Users\An\.gemini\antigravity\brain\f14093be-cf9b-4925-8b6c-af32c2ab72da\.user_uploaded\media_1790778131411.doc"
    $doc = $word.Documents.Open($docPath)
    $t = $doc.Tables.Item(6)

    Write-Output "Table 6 in media_1790778131411.doc:"
    for ($r = 1; $r -le 11; $r++) {
        $row = $t.Rows.Item($r)
        $h = $row.Height
        $hRule = $row.HeightRule
        $c1 = $t.Cell($r, 1).Range.Text.Trim().Replace("`r", "").Replace("`a", "")
        $c3 = $t.Cell($r, 3).Range.Text.Trim().Replace("`r", "").Replace("`a", "")
        $va1 = $t.Cell($r, 1).VerticalAlignment
        $va3 = $t.Cell($r, 3).VerticalAlignment
        $pSpaceBefore = $t.Cell($r, 1).Range.Paragraphs.Item(1).SpaceBefore
        $pSpaceAfter = $t.Cell($r, 1).Range.Paragraphs.Item(1).SpaceAfter
        Write-Output "R$r | H=$h (rule=$hRule) | VA1=$va1, VA3=$va3 | SpBefore=$pSpaceBefore, SpAfter=$pSpaceAfter | C1='$c1' | C3='$c3'"
    }
} finally {
    if ($doc) { $doc.Close() }
    $word.Quit()
}
