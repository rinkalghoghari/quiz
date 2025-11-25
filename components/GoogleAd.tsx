import React, { useEffect, useState, useRef } from 'react';
import { getRemoteConfigValue } from '@/lib/firebaseConfig';

declare global {
  interface Window {
    adsbygoogle: { [key: string]: unknown }[];
  }
}

// Define the props interface for type safety
interface GoogleAdProps {
  // The ad slot ID from Google AdSense
  adSlot?: string|number;
  // Optional custom class name for styling
  className?: string;
  // Optional style object for inline styling
  style?: React.CSSProperties;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
}

const GoogleAd: React.FC<GoogleAdProps> = ({ 
  adSlot: propAdSlot = '',
  className = '',
  style = {},
  format = 'auto'
}) => {
  const [adSlot, setAdSlot] = useState(propAdSlot);
  const [adEnabled, setAdEnabled] = useState<boolean | null>(null);
  const [isProduction, setIsProduction] = useState(false);
  const adRef = useRef<HTMLModElement>(null);
  const adPushed = useRef(false);

  // Check if we're in production
  useEffect(() => {
    setIsProduction(process.env.NODE_ENV === 'production');
  }, []);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    // Check GDPR consent
    const gdprConsent = localStorage.getItem('gdpr-consent');
    if (gdprConsent === 'false') {
      setAdEnabled(false);
      return;
    }

    // Get ad slot from Remote Config if not provided as prop
    if (!propAdSlot) {
      const remoteAdSlot = getRemoteConfigValue('google_ad_slot');
      if (remoteAdSlot) {
        console.log('Remote ad slot:', remoteAdSlot);
        setAdSlot(remoteAdSlot);
      }
    }

    // Check if ads are enabled in Remote Config
    const isAdEnabled = gdprConsent === 'true' && getRemoteConfigValue('google_ad_enabled') !== 'false';
    setAdEnabled(isAdEnabled);
  }, [propAdSlot]);
  useEffect(() => {
    if (!adEnabled || !adSlot || adPushed.current) return;

    try {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (window.adsbygoogle && adRef.current) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          adPushed.current = true;
          console.log('Ad initialized for slot:', adSlot);
        }
      }, 100);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error('AdSense initialization error:', error);
    }
  }, [adEnabled, adSlot]);

  // Loading state
  if (adEnabled === null) {
    return (
      <div className={className} style={{ minHeight: '100px', ...style }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          color: '#999'
        }}>
          Loading ad...
        </div>
      </div>
    );
  }

  // Ads disabled
  if (!adEnabled) {
    return null;
  }

  // No ad slot configured
  if (!adSlot) {
    return isProduction ? null : (
      <div className={className} style={{
        padding: '20px',
        border: '2px dashed #ff6b6b',
        borderRadius: '8px',
        backgroundColor: '#fff5f5',
        color: '#c92a2a',
        textAlign: 'center',
        ...style
      }}>
        ⚠️ Ad slot not configured. Set google_ad_slot in Firebase Remote Config.
      </div>
    );
  }

  // Development preview
  if (!isProduction) {
    return (
      <div className={className} style={{
        padding: '20px',
        border: '2px dashed #dee2e6',
        borderRadius: '8px',
        backgroundColor: '#f8f9fa',
        textAlign: 'center',
        minHeight: '100px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#495057' }}>
          📢 Advertisement Placeholder
        </div>
        <div style={{ fontSize: '12px', color: '#6c757d' }}>
          Slot: {adSlot}
        </div>
        <div style={{ fontSize: '11px', color: '#adb5bd', marginTop: '4px' }}>
          (Real ads will show in production)
        </div>
      </div>
    );
  }

  // Production ad
  return (
    <div className={`google-ad-container ${className}`} style={{ width: "100%", minWidth: "320px", ...style }}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-5504771682915102"
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default GoogleAd;