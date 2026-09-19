import React from 'react';

export const buildShareUrls = (title, text) => {
  const baseUrl = typeof window !== 'undefined' ? window.location.href : '';
  const encodedUrl = encodeURIComponent(baseUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(text);

  return {
    x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
  };
};

export const ShareBar = ({ title, text }) => {
  const share = buildShareUrls(title, text);
  return (
    <div className="mt-6 border-t pt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500" aria-label="Share links">
      <span>Share:</span>
      <a className="rounded bg-black px-3 py-1.5 text-white hover:opacity-90 transition-opacity" href={share.x} target="_blank" rel="noopener noreferrer">X</a>
      <a className="rounded bg-blue-700 px-3 py-1.5 text-white hover:opacity-90 transition-opacity" href={share.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
      <a className="rounded bg-blue-600 px-3 py-1.5 text-white hover:opacity-90 transition-opacity" href={share.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
      <a className="rounded bg-green-600 px-3 py-1.5 text-white hover:opacity-90 transition-opacity" href={share.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>
      <a className="rounded bg-sky-500 px-3 py-1.5 text-white hover:opacity-90 transition-opacity" href={share.telegram} target="_blank" rel="noopener noreferrer">Telegram</a>
    </div>
  );
};

export default ShareBar;
