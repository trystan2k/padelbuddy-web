import AppKit
import Foundation

struct SplashSpec {
  let size: CGSize
  let outputPath: String
}

struct IconSpec {
  let size: CGSize
  let outputPath: String
  let backgroundColor: NSColor?
  let paddingRatio: CGFloat
}

struct BrandingSpec {
  let size: CGSize
  let outputPath: String
}

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let iconURL = root.appendingPathComponent("public/icon-512x512.png")

guard let sourceImage = NSImage(contentsOf: iconURL) else {
  fputs("Failed to load source icon at \(iconURL.path)\n", stderr)
  exit(1)
}

let brandBlue = NSColor(
  calibratedRed: 0x2F as CGFloat / 255,
  green: 0x7C as CGFloat / 255,
  blue: 0xF6 as CGFloat / 255,
  alpha: 1
)

let splashSpecs: [SplashSpec] = [
  .init(size: .init(width: 2732, height: 2732), outputPath: "ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png"),
  .init(size: .init(width: 2732, height: 2732), outputPath: "ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-1.png"),
  .init(size: .init(width: 2732, height: 2732), outputPath: "ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-2.png"),
  .init(size: .init(width: 480, height: 320), outputPath: "android/app/src/main/res/drawable/splash.png"),
  .init(size: .init(width: 320, height: 480), outputPath: "android/app/src/main/res/drawable-port-mdpi/splash.png"),
  .init(size: .init(width: 480, height: 800), outputPath: "android/app/src/main/res/drawable-port-hdpi/splash.png"),
  .init(size: .init(width: 720, height: 1280), outputPath: "android/app/src/main/res/drawable-port-xhdpi/splash.png"),
  .init(size: .init(width: 960, height: 1600), outputPath: "android/app/src/main/res/drawable-port-xxhdpi/splash.png"),
  .init(size: .init(width: 1280, height: 1920), outputPath: "android/app/src/main/res/drawable-port-xxxhdpi/splash.png"),
  .init(size: .init(width: 480, height: 320), outputPath: "android/app/src/main/res/drawable-land-mdpi/splash.png"),
  .init(size: .init(width: 800, height: 480), outputPath: "android/app/src/main/res/drawable-land-hdpi/splash.png"),
  .init(size: .init(width: 1280, height: 720), outputPath: "android/app/src/main/res/drawable-land-xhdpi/splash.png"),
  .init(size: .init(width: 1600, height: 960), outputPath: "android/app/src/main/res/drawable-land-xxhdpi/splash.png"),
  .init(size: .init(width: 1920, height: 1280), outputPath: "android/app/src/main/res/drawable-land-xxxhdpi/splash.png")
]

let iconSpecs: [IconSpec] = [
  .init(size: .init(width: 1024, height: 1024), outputPath: "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png", backgroundColor: nil, paddingRatio: 0),
  .init(size: .init(width: 48, height: 48), outputPath: "android/app/src/main/res/mipmap-mdpi/ic_launcher.png", backgroundColor: nil, paddingRatio: 0.08),
  .init(size: .init(width: 48, height: 48), outputPath: "android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png", backgroundColor: nil, paddingRatio: 0.08),
  .init(size: .init(width: 72, height: 72), outputPath: "android/app/src/main/res/mipmap-hdpi/ic_launcher.png", backgroundColor: nil, paddingRatio: 0.08),
  .init(size: .init(width: 72, height: 72), outputPath: "android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png", backgroundColor: nil, paddingRatio: 0.08),
  .init(size: .init(width: 96, height: 96), outputPath: "android/app/src/main/res/mipmap-xhdpi/ic_launcher.png", backgroundColor: nil, paddingRatio: 0.08),
  .init(size: .init(width: 96, height: 96), outputPath: "android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png", backgroundColor: nil, paddingRatio: 0.08),
  .init(size: .init(width: 144, height: 144), outputPath: "android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png", backgroundColor: nil, paddingRatio: 0.08),
  .init(size: .init(width: 144, height: 144), outputPath: "android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png", backgroundColor: nil, paddingRatio: 0.08),
  .init(size: .init(width: 192, height: 192), outputPath: "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png", backgroundColor: nil, paddingRatio: 0.08),
  .init(size: .init(width: 192, height: 192), outputPath: "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png", backgroundColor: nil, paddingRatio: 0.08),
  .init(size: .init(width: 162, height: 162), outputPath: "android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png", backgroundColor: nil, paddingRatio: 0.18),
  .init(size: .init(width: 243, height: 243), outputPath: "android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png", backgroundColor: nil, paddingRatio: 0.18),
  .init(size: .init(width: 324, height: 324), outputPath: "android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png", backgroundColor: nil, paddingRatio: 0.18),
  .init(size: .init(width: 216, height: 216), outputPath: "android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png", backgroundColor: nil, paddingRatio: 0.18),
  .init(size: .init(width: 432, height: 432), outputPath: "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png", backgroundColor: nil, paddingRatio: 0.18),
  .init(size: .init(width: 288, height: 288), outputPath: "android/app/src/main/res/drawable-nodpi/splash_foreground.png", backgroundColor: nil, paddingRatio: 0.08)
]

let brandingSpecs: [BrandingSpec] = [
  .init(size: .init(width: 800, height: 160), outputPath: "android/app/src/main/res/drawable-nodpi/splash_branding.png")
]

func ensureDirectory(for outputURL: URL) throws {
  try FileManager.default.createDirectory(
    at: outputURL.deletingLastPathComponent(),
    withIntermediateDirectories: true
  )
}

func pngData(from drawing: () -> Void, size: CGSize) -> Data? {
  let width = Int(size.width)
  let height = Int(size.height)

  guard let bitmap = NSBitmapImageRep(
    bitmapDataPlanes: nil,
    pixelsWide: width,
    pixelsHigh: height,
    bitsPerSample: 8,
    samplesPerPixel: 4,
    hasAlpha: true,
    isPlanar: false,
    colorSpaceName: .deviceRGB,
    bytesPerRow: 0,
    bitsPerPixel: 0
  ), let graphicsContext = NSGraphicsContext(bitmapImageRep: bitmap) else {
    return nil
  }

  bitmap.size = size

  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = graphicsContext
  drawing()
  graphicsContext.flushGraphics()
  NSGraphicsContext.restoreGraphicsState()

  return bitmap.representation(using: .png, properties: [:])
}

func writeImage(_ image: NSImage, to outputPath: String, size: CGSize) throws {
  let outputURL = root.appendingPathComponent(outputPath)
  try ensureDirectory(for: outputURL)

  guard let data = pngData(from: {
    image.draw(
      in: CGRect(origin: .zero, size: size),
      from: .zero,
      operation: .sourceOver,
      fraction: 1,
      respectFlipped: false,
      hints: [.interpolation: NSImageInterpolation.high]
    )
  }, size: size) else {
    throw NSError(domain: "asset-generator", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to encode PNG for \(outputPath)"])
  }

  try data.write(to: outputURL)
}

func makeCanvas(size: CGSize, drawing: () -> Void) -> NSImage {
  let image = NSImage(size: size)
  image.lockFocus()
  drawing()
  image.unlockFocus()
  return image
}

func drawSplash(size: CGSize) -> NSImage {
  let minDimension = min(size.width, size.height)
  let isLandscape = size.width > size.height
  let iconSide = minDimension * (isLandscape ? 0.24 : 0.21)
  let gap = iconSide * 0.12
  let maxGroupWidth = size.width * (isLandscape ? 0.76 : 0.82)
  var fontSize = minDimension * (isLandscape ? 0.11 : 0.075)

  func textAttributes(fontSize: CGFloat) -> [NSAttributedString.Key: Any] {
    let paragraph = NSMutableParagraphStyle()
    paragraph.alignment = .left
    return [
      .font: NSFont.systemFont(ofSize: fontSize, weight: .bold),
      .foregroundColor: NSColor.white,
      .paragraphStyle: paragraph
    ]
  }

  var title = NSAttributedString(string: "Padel Buddy", attributes: textAttributes(fontSize: fontSize))
  while title.size().width + gap + iconSide > maxGroupWidth, fontSize > 12 {
    fontSize *= 0.95
    title = NSAttributedString(string: "Padel Buddy", attributes: textAttributes(fontSize: fontSize))
  }

  let textSize = title.size()
  let groupWidth = iconSide + gap + textSize.width
  let iconRect = CGRect(
    x: (size.width - groupWidth) / 2,
    y: (size.height - iconSide) / 2,
    width: iconSide,
    height: iconSide
  )
  let textRect = CGRect(
    x: iconRect.maxX + gap,
    y: (size.height - textSize.height) / 2 - (fontSize * 0.08),
    width: textSize.width,
    height: textSize.height * 1.1
  )

  return makeCanvas(size: size) {
    brandBlue.setFill()
    NSBezierPath(rect: CGRect(origin: .zero, size: size)).fill()

    sourceImage.draw(
      in: iconRect,
      from: .zero,
      operation: .sourceOver,
      fraction: 1,
      respectFlipped: true,
      hints: [.interpolation: NSImageInterpolation.high]
    )

    title.draw(in: textRect)
  }
}

func drawIcon(size: CGSize, backgroundColor: NSColor?, paddingRatio: CGFloat) -> NSImage {
  let inset = min(size.width, size.height) * paddingRatio
  let iconRect = CGRect(x: inset, y: inset, width: size.width - (inset * 2), height: size.height - (inset * 2))

  return makeCanvas(size: size) {
    if let backgroundColor {
      backgroundColor.setFill()
      NSBezierPath(rect: CGRect(origin: .zero, size: size)).fill()
    } else {
      NSColor.clear.setFill()
      NSBezierPath(rect: CGRect(origin: .zero, size: size)).fill()
    }

    sourceImage.draw(
      in: iconRect,
      from: .zero,
      operation: .sourceOver,
      fraction: 1,
      respectFlipped: true,
      hints: [.interpolation: NSImageInterpolation.high]
    )
  }
}

func drawBranding(size: CGSize) -> NSImage {
  let fontSize = size.height * 0.46

  let paragraph = NSMutableParagraphStyle()
  paragraph.alignment = .center

  let title = NSAttributedString(
    string: "Padel Buddy",
    attributes: [
      .font: NSFont.systemFont(ofSize: fontSize, weight: .bold),
      .foregroundColor: NSColor.white,
      .paragraphStyle: paragraph
    ]
  )

  let textSize = title.size()
  let textRect = CGRect(
    x: (size.width - textSize.width) / 2,
    y: (size.height - textSize.height) / 2 - (fontSize * 0.04),
    width: textSize.width,
    height: textSize.height * 1.1
  )

  return makeCanvas(size: size) {
    NSColor.clear.setFill()
    NSBezierPath(rect: CGRect(origin: .zero, size: size)).fill()
    title.draw(in: textRect)
  }
}

do {
  for spec in splashSpecs {
    let image = drawSplash(size: spec.size)
    try writeImage(image, to: spec.outputPath, size: spec.size)
  }

  for spec in iconSpecs {
    let image = drawIcon(size: spec.size, backgroundColor: spec.backgroundColor, paddingRatio: spec.paddingRatio)
    try writeImage(image, to: spec.outputPath, size: spec.size)
  }

  for spec in brandingSpecs {
    let image = drawBranding(size: spec.size)
    try writeImage(image, to: spec.outputPath, size: spec.size)
  }
} catch {
  fputs("\(error.localizedDescription)\n", stderr)
  exit(1)
}
