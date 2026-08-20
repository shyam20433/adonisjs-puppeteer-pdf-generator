import path from 'path'
import { promises as fs } from 'fs'

type ChartConfig = {
  type: 'pie' | 'bar'

  data: {
    label: string
    value: number
  }[]
}

type PageConfig = {
  page: number
  imageCount: number
  chart?: ChartConfig[]
}

export default class PageWiseImagePdfRepository {

  private imageDirectory =
    path.join(
      process.cwd(),
      'public',
      'images'
    )

  private supportedExtensions = [
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
    '.gif',
  ]

  public async getLocalImages(): Promise<string[]> {

    const files =
      await fs.readdir(
        this.imageDirectory
      )

    return files
      .filter(file =>
        this.supportedExtensions.includes(
          path.extname(file).toLowerCase()
        )
      )
      .sort()
  }

  public async imageToDataUrl(
    fileName: string
  ): Promise<string> {

    const filePath =
      path.join(
        this.imageDirectory,
        fileName
      )

    const image =
      await fs.readFile(
        filePath
      )

    const extension =
      path.extname(fileName)
        .toLowerCase()

    let mimeType: string

    switch (extension) {

      case '.png':
        mimeType = 'image/png'
        break

      case '.jpg':
      case '.jpeg':
        mimeType = 'image/jpeg'
        break

      case '.webp':
        mimeType = 'image/webp'
        break

      case '.gif':
        mimeType = 'image/gif'
        break

      default:
        throw new Error(
          `Unsupported image format: ${extension}`
        )
    }

    return (
      `data:${mimeType};base64,` +
      image.toString('base64')
    )
  }

  public async getImagesForPage(
    imageIndex: number,
    imageCount: number,
    pageNumber: number
  ): Promise<{
    images: string[]
    nextImageIndex: number
  }> {

    const localImages =
      await this.getLocalImages()

    const pageImages: string[] = []

    for (
      let i = 0;
      i < imageCount;
      i++
    ) {

      const fileName =
        localImages[imageIndex]

      if (!fileName) {
        const available =pageImages.length
        const missing =imageCount - available
        throw new Error(
          `Insufficient images for page ${pageNumber}. ` +
          `Required: ${imageCount}, ` +
          `Available: ${available}, ` +
          `Missing: ${missing}`
        )
      }

      const dataUrl =
        await this.imageToDataUrl(
          fileName
        )

      pageImages.push(
        dataUrl
      )

      imageIndex++
    }

    return {
      images: pageImages,
      nextImageIndex: imageIndex,
    }
  }
}
