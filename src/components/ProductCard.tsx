import React, { useMemo, useState } from "react";
import { ProductCardProps } from "../types/product/ProductComponents";
import { getProductImageUrl } from "../utils/productExtractor";
import { cn } from "../lib/utils";

const ProductCard = ({ partNumber, name, url, description, imageUrl: propImageUrl }: ProductCardProps) => {
    const imageUrl = propImageUrl || getProductImageUrl(partNumber);
    const [imageFailed, setImageFailed] = useState(false);

    const fallbackSvg = useMemo(() => {
        const svg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
  <rect width="80" height="80" fill="hsl(173 58% 95%)"/>
  <rect x="16" y="16" width="48" height="48" rx="6" fill="hsl(173 58% 90%)" stroke="hsl(173 58% 70%)" stroke-width="1"/>
  <path d="M28 50 L40 38 L52 50" stroke="hsl(173 58% 39%)" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="32" cy="32" r="4" fill="hsl(173 58% 39%)"/>
</svg>`);
        return `data:image/svg+xml;charset=utf-8,${svg}`;
    }, []);

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "block rounded-xl overflow-hidden",
                "bg-gradient-to-br from-card to-muted/50",
                "border border-border",
                "shadow-sm hover:shadow-md",
                "hover:border-primary/50",
                "transition-all duration-200 group"
            )}
        >
            <div className="flex">
                {/* Image */}
                <div className="w-24 h-24 flex-shrink-0 bg-gradient-to-br from-accent to-muted flex items-center justify-center p-2">
                    <img
                        src={imageFailed ? fallbackSvg : imageUrl}
                        alt={name}
                        className="w-full h-full object-contain rounded"
                        onError={() => !imageFailed && setImageFailed(true)}
                    />
                </div>

                {/* Content */}
                <div className="flex-1 p-3 min-w-0 flex flex-col justify-between">
                    <div>
                        <h4 className="font-semibold text-sm text-card-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                            {name}
                        </h4>
                        <p className="text-xs text-primary font-semibold mt-1 tracking-wide">
                            {partNumber}
                        </p>
                    </div>
                    {description && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1 leading-relaxed">
                            {description}
                        </p>
                    )}
                    <div className="flex items-center mt-2 text-xs font-medium text-primary group-hover:text-primary/80">
                        <span>View on PartSelect</span>
                        <svg className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </div>
                </div>
            </div>
        </a>
    );
};

export default ProductCard;
