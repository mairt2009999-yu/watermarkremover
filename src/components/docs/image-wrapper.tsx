import type { ComponentProps } from 'react';

interface ImageWrapperProps extends ComponentProps<'img'> {
  src: string;
  alt?: string;
}

export const ImageWrapper = ({ src, alt, ...props }: ImageWrapperProps) => {
  if (!src) {
    return null;
  }

  return (
    <img
      src={src}
      alt={alt || 'image'}
      {...props}
      style={{
        width: '100%',
        height: 'auto',
        objectFit: 'contain',
      }}
    />
  );
};
