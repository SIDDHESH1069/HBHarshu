# Generate placeholder MP3 files
$audioDir = "c:\Users\Siddhesh\OneDrive\Desktop\hbh\assets\audio"
New-Item -ItemType Directory -Force -Path $audioDir | Out-Null

function New-Mp3 {
    param([string]$Path, [double]$Duration)
    $id3 = [byte[]]@(0x49,0x44,0x33,0x03,0x00,0x00,0x00,0x00,0x00,0x00)
    $hdr = [byte[]]@(0xFF,0xFB,0x90,0x00)
    $body = New-Object byte[] 413
    $n = [Math]::Max(1,[Math]::Ceiling(($Duration*1000)/26.12))
    $ms = New-Object System.IO.MemoryStream
    $ms.Write($id3,0,$id3.Length)
    for($i=0;$i -lt $n;$i++){$ms.Write($hdr,0,4);$ms.Write($body,0,413)}
    [System.IO.File]::WriteAllBytes($Path,$ms.ToArray())
    $ms.Dispose()
    $sz=(Get-Item $Path).Length
    Write-Host "Created: $(Split-Path $Path -Leaf) ($sz bytes)"
}

$files=@(
@("bg-music.mp3",3.0),@("click.mp3",0.1),@("bow-pull.mp3",0.5),
@("arrow-shoot.mp3",0.3),@("heart-burst.mp3",0.5),@("text-pop.mp3",0.05),
@("tap-next.mp3",0.3),@("match-strike.mp3",0.3),@("blow.mp3",0.5),
@("cheer.mp3",1.0),@("balloon-pop.mp3",0.2),@("card-reveal.mp3",0.3),
@("all-popped.mp3",0.5),@("swipe.mp3",0.2),@("envelope-open.mp3",0.5),
@("typewriter.mp3",0.3),@("finale-fanfare.mp3",1.5)
)
foreach($f in $files){New-Mp3 -Path (Join-Path $audioDir $f[0]) -Duration $f[1]}
Write-Host "`nDone! Listing:"
Get-ChildItem $audioDir -Filter *.mp3 | Format-Table Name,Length -AutoSize
