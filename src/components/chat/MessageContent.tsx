import React from "react";
import { marked } from "marked";
import { MessageContentProps } from "../../types/chat/ChatComponents";
import ProductCard from "../ProductCard";

const MessageContent = ({
    content,
    messageIndex,
    isUser,
    productData,
}: MessageContentProps) => {
    // Simple markdown render for user messages or no products
    const renderMarkdown = (text: string) => (
        <div
            className="prose prose-sm max-w-none"
            style={{ lineHeight: "1.6" }}
            dangerouslySetInnerHTML={{
                __html: marked(text, { breaks: true }),
            }}
        />
    );

    if (isUser) {
        return (
            <div className="text-white" style={{ lineHeight: "1.5" }}>
                {content}
            </div>
        );
    }

    const products = productData.get(messageIndex)?.filter((p: any) => p?.partNumber && p?.url) || [];

    if (products.length === 0) {
        return renderMarkdown(content);
    }

    // Create product lookup map
    const productMap = new Map<string, any>();
    products.forEach((p: any) => productMap.set(p.partNumber.toUpperCase(), p));

    // Find all part numbers in content
    const partNumberRegex = /PS\d{5,10}/gi;
    const seenPartNumbers = new Set<string>();
    const matches: Array<{ partNumber: string; index: number }> = [];

    let match;
    while ((match = partNumberRegex.exec(content)) !== null) {
        const pn = match[1]?.toUpperCase() || match[0].toUpperCase();
        if (!seenPartNumbers.has(pn) && productMap.has(pn)) {
            matches.push({ partNumber: pn, index: match.index });
            seenPartNumbers.add(pn);
        }
    }

    if (matches.length === 0) {
        return renderMarkdown(content);
    }

    matches.sort((a, b) => a.index - b.index);

    // Clean up content: remove markdown artifacts around part numbers
    let cleanContent = content
        // Remove patterns like "(Part Number: PS12345)" or "(PS12345)"
        .replace(/\((?:Part\s*(?:Number|#)?:?\s*)?(PS\d{5,10})\)/gi, '$1')
        // Remove trailing )** or )**
        .replace(/\)\*{0,2}(?=\s|$)/g, '')
        // Remove **( patterns
        .replace(/\*{2}\(/g, '')
        // Clean up orphaned asterisks
        .replace(/\*{2}(?=\s*PS\d)/g, '')
        .replace(/(PS\d{5,10})\*{2}/g, '$1')
        // Clean multiple spaces
        .replace(/\s{2,}/g, ' ');

    // Re-find matches in cleaned content
    const cleanMatches: Array<{ partNumber: string; index: number }> = [];
    const cleanSeen = new Set<string>();

    while ((match = partNumberRegex.exec(cleanContent)) !== null) {
        const pn = match[0].toUpperCase();
        if (!cleanSeen.has(pn) && productMap.has(pn)) {
            cleanMatches.push({ partNumber: pn, index: match.index });
            cleanSeen.add(pn);
        }
    }

    if (cleanMatches.length === 0) {
        return renderMarkdown(cleanContent);
    }

    cleanMatches.sort((a, b) => a.index - b.index);

    // Split into segments
    const segments: Array<{ type: "text" | "product"; content?: string; partNumber?: string }> = [];
    let lastIndex = 0;

    cleanMatches.forEach((m) => {
        // Text before part number
        if (m.index > lastIndex) {
            const text = cleanContent.substring(lastIndex, m.index).trim();
            if (text) segments.push({ type: "text", content: text });
        }
        // Product card
        segments.push({ type: "product", partNumber: m.partNumber });
        lastIndex = m.index + m.partNumber.length;
    });

    // Remaining text
    if (lastIndex < cleanContent.length) {
        const text = cleanContent.substring(lastIndex).trim();
        if (text) segments.push({ type: "text", content: text });
    }

    return (
        <div className="space-y-3">
            {segments.map((segment, idx) => {
                if (segment.type === "product" && segment.partNumber) {
                    const product = productMap.get(segment.partNumber);
                    if (product) {
                        return (
                            <ProductCard
                                key={`product-${idx}`}
                                partNumber={product.partNumber}
                                name={product.name || product.partNumber}
                                url={product.url}
                                description={product.description}
                                imageUrl={product.imageUrl}
                            />
                        );
                    }
                }
                if (segment.content) {
                    return (
                        <div
                            key={`text-${idx}`}
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{
                                __html: marked(segment.content, { breaks: true }),
                            }}
                        />
                    );
                }
                return null;
            })}
        </div>
    );
};

export default MessageContent;
