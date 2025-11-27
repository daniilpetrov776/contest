import fs from 'node:fs'
import { basename as _basename, extname } from 'node:path'
import Fontmin from 'fontmin'

const buildFolder = './assets'
const srcFolder = './src'
const appFolder = '.'

const path = {
    build: {
        fonts: `${buildFolder}/fonts/`,
    },
    src: {
        fonts: `${srcFolder}/fonts/*.*`,
    },
    buildFolder,
    srcFolder,
    appFolder,
}

interface FontWeight {
    [key: string]: number
}

interface FontStyle {
    [key: string]: string
}

const fontWeights: FontWeight = {
    thin: 100,
    extralight: 200,
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    heavy: 800,
    black: 900,
}

const fontStyles: FontStyle = {
    normal: 'normal',
    italic: 'italic',
    oblique: 'oblique',
}

function isValidFontFile(filename: string): boolean {
    const invalidFiles = ['.DS_Store', 'Thumbs.db', '.gitkeep', '.gitignore', 'desktop.ini']
    const validExtensions = ['.woff', '.woff2', '.ttf', '.otf']
    const ext = extname(filename).toLowerCase()

    return !invalidFiles.includes(filename) && validExtensions.includes(ext) && !filename.startsWith('.')
}

async function ensureDirectoryExists(dir: string): Promise<void> {
    try {
        await fs.promises.access(dir)
    } catch {
        await fs.promises.mkdir(dir, { recursive: true })
    }
}

async function convertOtfToTtf(): Promise<void> {
    console.warn('Converting OTF to TTF...')
    const otfFiles = await fs.promises
        .readdir(`${srcFolder}/fonts`)
        .then(files => files.filter(file => file.endsWith('.otf') && isValidFontFile(file)))
        .catch(() => [])

    if (otfFiles.length === 0) {
        console.warn('No OTF files found')
        return
    }

    for (const file of otfFiles) {
        console.warn(`Converting ${file}...`)
        const inputPath = `${srcFolder}/fonts/${file}`

        try {
            const fontmin = new Fontmin().src(inputPath).dest(`${srcFolder}/fonts/`).use(Fontmin.otf2ttf())

            await new Promise<void>((resolve, reject) => {
                fontmin.run((err) => {
                    if (err) {
                        console.error(`Error converting ${file}:`, err)
                        reject(err)
                    } else {
                        console.warn(`Converted ${file} to TTF`)
                        resolve()
                    }
                })
            })
        } catch (error) {
            console.error(`Error processing ${file}:`, error)
        }
    }
}

async function convertTtfToWoff(): Promise<void> {
    console.warn('Converting TTF to WOFF/WOFF2...')
    const ttfFiles = await fs.promises
        .readdir(`${srcFolder}/fonts`)
        .then(files => files.filter(file => file.endsWith('.ttf') && isValidFontFile(file)))
        .catch(() => [])

    if (ttfFiles.length === 0) {
        console.warn('No TTF files found')
        return
    }

    await ensureDirectoryExists(path.build.fonts)

    for (const file of ttfFiles) {
        console.warn(`Converting ${file}...`)
        const inputPath = `${srcFolder}/fonts/${file}`

        try {
            const woffFontmin = new Fontmin().src(inputPath).dest(path.build.fonts).use(Fontmin.ttf2woff())

            await new Promise<void>((resolve, reject) => {
                woffFontmin.run((err) => {
                    if (err) {
                        console.error(`Error converting ${file} to WOFF:`, err)
                        reject(err)
                    } else {
                        console.warn(`Converted ${file} to WOFF`)
                        resolve()
                    }
                })
            })

            const woff2Fontmin = new Fontmin().src(inputPath).dest(path.build.fonts).use(Fontmin.ttf2woff2())

            await new Promise<void>((resolve, reject) => {
                woff2Fontmin.run((err) => {
                    if (err) {
                        console.error(`Error converting ${file} to WOFF2:`, err)
                        reject(err)
                    } else {
                        console.warn(`Converted ${file} to WOFF2`)
                        resolve()
                    }
                })
            })
        } catch (error) {
            console.error(`Error processing ${file}:`, error)
        }
    }

    console.warn('Cleaning up TTF files from assets/fonts...')
    try {
        const publicFonts = await fs.promises.readdir(path.build.fonts)
        const ttfFilesToRemove = publicFonts.filter(file => file.endsWith('.ttf') && isValidFontFile(file))

        for (const file of ttfFilesToRemove) {
            await fs.promises.unlink(`${path.build.fonts}${file}`)
            console.warn(`Removed ${file} from assets/fonts`)
        }
    } catch (error) {
        console.error('Error cleaning up TTF files:', error)
    }
}

function getFontWeight(basename: string): number {
    for (const [key, value] of Object.entries(fontWeights)) {
        if (basename.includes(key)) {
            return value
        }
    }
    return 400
}

function getFontStyle(basename: string): string {
    for (const [key, value] of Object.entries(fontStyles)) {
        if (basename.includes(key)) {
            return value
        }
    }
    return 'normal'
}

async function generateFontsScss(): Promise<void> {
    console.warn('Generating fonts.scss...')
    const fontsFile = `${appFolder}/scss/fonts/fonts.scss`

    try {
        const allFiles = await fs.promises.readdir(path.build.fonts)
        const fonts = allFiles.filter(isValidFontFile)

        const filteredFiles = allFiles.filter(file => !isValidFontFile(file))
        if (filteredFiles.length > 0) {
            console.warn(`Ignored files: ${filteredFiles.join(', ')}`)
        }

        if (fonts.length) {
            await fs.promises.writeFile(fontsFile, '')
            const processedFonts = new Set<string>()

            for (const font of fonts) {
                const ext = extname(font)
                const fontFileName = _basename(font, ext)
                const basename = fontFileName.toLowerCase()
                const fontName = fontFileName.split('-')[0] ?? basename

                if (!processedFonts.has(fontFileName)) {
                    const fontWeight = getFontWeight(basename)
                    const fontStyle = getFontStyle(basename)

                    const fontFaceRule = `@font-face {
\tfont-family: '${fontName}';
\tfont-display: swap;
\tsrc: url("../../assets/fonts/${fontFileName}.woff2") format("woff2"), url("../../assets/fonts/${fontFileName}.woff") format("woff");
\tfont-weight: ${fontWeight};
\tfont-style: ${fontStyle};
}
`

                    await fs.promises.appendFile(fontsFile, fontFaceRule)
                    processedFonts.add(fontFileName)
                }
            }
        } else {
            try {
                await fs.promises.unlink(fontsFile)
            } catch {}
        }
    } catch (error) {
        console.error('Error generating fonts.scss:', error)
    }
}

async function processFonts(): Promise<void> {
    try {
        await convertOtfToTtf()
        await convertTtfToWoff()
        await generateFontsScss()
        console.warn('Fonts processing completed successfully!')
    } catch (error) {
        console.error('Error processing fonts:', error)
        process.exit(1)
    }
}

processFonts()
