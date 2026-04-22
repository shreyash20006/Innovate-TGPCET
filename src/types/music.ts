export interface Track {
  id: string;
  name: string;
  artists: string;
  album: string;
  image: string;
  preview_url: string | null;
  duration_ms: number;
  external_url: string;
  viewCount?: string;
}
