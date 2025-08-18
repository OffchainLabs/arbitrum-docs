interface ImageWithCaptionProps {
  src: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function ImageWithCaption({ 
  src, 
  alt = '', 
  caption, 
  width, 
  height, 
  className 
}: ImageWithCaptionProps) {
  return (
    <figure className={`my-4 ${className || ''}`}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="max-w-full h-auto rounded-lg"
      />
      {caption && (
        <figcaption className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}