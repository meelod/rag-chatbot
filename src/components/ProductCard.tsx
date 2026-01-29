import React, { useMemo, useState } from "react";
import { ProductCardProps } from "../types/product/ProductComponents";
import { getProductImageUrl } from "../utils/productExtractor";

const ProductCard = ({ partNumber, name, url, description, imageUrl: propImageUrl }: ProductCardProps) => {
    const imageUrl = propImageUrl || getProductImageUrl(partNumber);
    const [imageFailed, setImageFailed] = useState(false);

    const fallbackSvg = useMemo(() => {
        const svg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
  <rect width="80" height="80" fill="#f0fdfa"/>
  <rect x="16" y="16" width="48" height="48" rx="6" fill="#ccfbf1" stroke="#5eead4" stroke-width="1"/>
  <path d="M28 50 L40 38 L52 50" stroke="#14b8a6" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="32" cy="32" r="4" fill="#14b8a6"/>
</svg>`);
        return `data:image/svg+xml;charset=utf-8,${svg}`;
    }, []);

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl overflow-hidden bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-400 transition-all duration-200 group"
        >
            <div className="flex">
                {/* Image */}
                <div className="w-24 h-24 flex-shrink-0 bg-gradient-to-br from-teal-50 to-slate-100 flex items-center justify-center p-2">
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
                        <h4 className="font-semibold text-sm text-slate-800 line-clamp-2 group-hover:text-teal-700 transition-colors leading-tight">
                            {name}
                        </h4>
                        <p className="text-xs text-teal-600 font-semibold mt-1 tracking-wide">
                            {partNumber}
                        </p>
                    </div>
                    {description && (
                        <p className="text-xs text-slate-500 mt-1.5 line-clamp-1 leading-relaxed">
                            {description}
                        </p>
                    )}
                    <div className="flex items-center mt-2 text-xs font-medium text-teal-600 group-hover:text-teal-700">
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
