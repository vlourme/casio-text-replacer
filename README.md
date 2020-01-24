<p align="center">
    <img src="assets/screen.png" />
</p>

<h1 align="center">CASIO OS Text Replacer</h1>

> Replace the helper texts of your CASIO calculator with your own.

## Disclaimer
> **This tool is not made to cheat nor to incite people to cheat on their exams. This is for education purposes only and I'm not responsible in case of wrong usage of this tool.**

## Usage
**Note 1:** This could be uncomplete or not working on every systems and calculators.
**Note 2:** This as been designed for 35+E and 75+E models, and heavily based on 75+E OS ([hex addresses](docs/Text%20Offsets.md)).

1. Get your OS binary (backup it from your calculator using [FxRemote](https://tiplanet.org/forum/archives_voir.php?id=301094) or download it on Internet).
2. Download this tool ([Releases](https://github.com/vlourme/casio-text-replacer/releases))
3. Edit the OS using the tool: `./ctr -o out.bin interactive -r ./path_to_the_os.bin`
4. Patch the system (checksum or/and size, using [PolyOS](https://tiplanet.org/forum/archives_voir.php?id=4475) in most cases)
5. Flash the system using [FxRemote](https://tiplanet.org/forum/archives_voir.php?id=301094).

### Command-line options
| Options | Type | Description |
|:-------:|:----:|:-----------:|
| `-r`, `--ranges` | Boolean | Allow you to choose the area to edit, **best option in most of cases** |
| `-a`, `--all` | Boolean | Read the entire file, **this will causes crash on a complete OS binary!** |
| `-f`, `--from` | String | Read the file from a certain hex address/offset (e.g.: 0x00003FA1) |
| `-t`, `--to` | String | Stop reading the file at a certain hex address/offset (e.g.: 0x0021F4B1) |
| `-o`, `--output` | String | Save the edited binary to the given path |

## How it works ?
**Note:** This is designed for Casio 35+E and 75+E, I recommand upgrading your system to the 75+E one if you're having a 35+E model.

This tool will cut and format correctly the text from the binary file of the OS and let you replace texts with something other. This is a pretty simple process, the only thing is to respect breaks from the system and there are two types:
- `00 20`, that I'll call **basic break**.
- `20 20` repeated *n times*, that I'll call **long break**.
- `00 20 20 00`, that I'll call **advanced break**.

Once we identified **breaks and every texts with their maximum lengths**, we're able to replace them and **render a new binary file**.

*Hex-editor view :*
<p align="center">
    <img src="assets/hex-editor.png" />
</p>

## Notes
- **Again, this is not made to cheat on exams.**
- This is an experiment, expect bugs and this is not a finished tool, a lot of edits are coming.

## Credits
- TiPlanet and Planet-Casio for PolyOS, FxRemote and finding the [initial method](https://tiplanet.org/forum/viewtopic.php?f=49&t=19297).
- Victor Lourme for tool development
<p align="center">
    <img src="assets/exp.png" width="256">
    <br />
    <b>Viqtxr Experiments.</b>
</p>