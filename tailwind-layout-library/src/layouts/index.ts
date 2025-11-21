import SidebarLayout, { metadata as sidebarMeta } from './sidebar';
import HolyGrailLayout, { metadata as holyGrailMeta } from './holy-grail';
import GridAutoLayout, { metadata as gridAutoMeta } from './grid-auto';
import FlexCenterLayout, { metadata as flexCenterMeta } from './flex-center';
import CardGridLayout, { metadata as cardGridMeta } from './card-grid';
import DashboardLayout, { metadata as dashboardMeta } from './dashboard';
import MasonryLayout, { metadata as masonryMeta } from './masonry';
import SplitViewLayout, { metadata as splitViewMeta } from './split-view';
import StickyFooterLayout, { metadata as stickyFooterMeta } from './sticky-footer';
import ResponsiveNavLayout, { metadata as responsiveNavMeta } from './responsive-nav';

export interface LayoutModule {
  id: string;
  component: React.ComponentType;
  metadata: {
    name: string;
    description: string;
    category: string;
  };
}

export const layouts: LayoutModule[] = [
  { id: 'sidebar', component: SidebarLayout, metadata: sidebarMeta },
  { id: 'holy-grail', component: HolyGrailLayout, metadata: holyGrailMeta },
  { id: 'grid-auto', component: GridAutoLayout, metadata: gridAutoMeta },
  { id: 'flex-center', component: FlexCenterLayout, metadata: flexCenterMeta },
  { id: 'card-grid', component: CardGridLayout, metadata: cardGridMeta },
  { id: 'dashboard', component: DashboardLayout, metadata: dashboardMeta },
  { id: 'masonry', component: MasonryLayout, metadata: masonryMeta },
  { id: 'split-view', component: SplitViewLayout, metadata: splitViewMeta },
  { id: 'sticky-footer', component: StickyFooterLayout, metadata: stickyFooterMeta },
  { id: 'responsive-nav', component: ResponsiveNavLayout, metadata: responsiveNavMeta },
];

export const categories = [...new Set(layouts.map(l => l.metadata.category))];
