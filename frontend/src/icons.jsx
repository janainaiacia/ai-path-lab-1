import {
  ArrowRight,
  Image,
  Maximize2,
  LoaderCircle,
  MessageCircle,
  Search,
  TriangleAlert,
  X,
} from 'lucide-react';

// The design's icons are Lucide shapes drawn at stroke-width 2.75 — heavier
// than Lucide's default of 2, and a good part of what makes the Organic system
// look the way it does. This module exists to set that weight once and to map
// the design's names onto the package's, so components import by intent
// ("SpinnerIcon") rather than by shape ("LoaderCircle").

const STROKE = 2.75;

const withDesignStroke = (Icon) => {
  const Wrapped = (props) => <Icon strokeWidth={STROKE} {...props} />;
  Wrapped.displayName = `Design(${Icon.displayName ?? Icon.name})`;
  return Wrapped;
};

export const ImageIcon = withDesignStroke(Image);
export const SearchIcon = withDesignStroke(Search);
export const SpinnerIcon = withDesignStroke(LoaderCircle);
export const ChatIcon = withDesignStroke(MessageCircle);
export const WarningIcon = withDesignStroke(TriangleAlert);
export const CloseIcon = withDesignStroke(X);
export const SendIcon = withDesignStroke(ArrowRight);
export const MaximizeIcon = withDesignStroke(Maximize2);
