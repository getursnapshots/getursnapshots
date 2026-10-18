import React from 'react';
import { VideoLightbox } from './VideoLightbox';
import { ReelWorkItem } from '../types';

interface PortfolioModalProps {
  reel: ReelWorkItem | null;
  onClose: () => void;
  onBookShoot: (category: string) => void;
}

export const PortfolioModal: React.FC<PortfolioModalProps> = (props) => {
  return <VideoLightbox {...props} />;
};
