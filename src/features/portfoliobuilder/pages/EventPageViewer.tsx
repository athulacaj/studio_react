import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { getPublishedPortfolio } from '../services/portfolioService';
import { EventPortfolio } from '../types/types';

const EventPageViewer: React.FC = () => {
  const { eventpath } = useParams<{ eventpath: string }>();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [portfolio, setPortfolio] = useState<EventPortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch published portfolio data
  useEffect(() => {
    const fetchData = async () => {
      if (!eventpath) return;
      try {
        const data = await getPublishedPortfolio(eventpath);
        if (data) {
          setPortfolio(data);
        } else {
          setError('Event page not found');
        }
      } catch (err) {
        console.error('Failed to fetch portfolio:', err);
        // Fallback: try loading the static HTML template by name
        setPortfolio(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventpath]);

  // Send data to iframe when portfolio loads or template is ready
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'TEMPLATE_READY' && portfolio) {
        iframeRef.current?.contentWindow?.postMessage(
          { type: 'UPDATE_DATA', data: portfolio.data },
          '*'
        );
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [portfolio]);

  // If no published data found, fall back to loading the static HTML by eventpath
  const iframeSrc = portfolio
    ? `/html/${portfolio.templateId}.html`
    : `/html/${eventpath}.html`;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !portfolio) {
    // Attempt fallback to static template
    return (
      <div style={{ width: '100%', height: '100vh' }}>
        <iframe
          ref={iframeRef}
          src={`/html/${eventpath}.html`}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          title="Event Page"
        />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        title="Event Page"
      />
    </div>
  );
};

export default EventPageViewer;