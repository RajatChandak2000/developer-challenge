export interface Post {
    _id: string;
    caption: string;
    artist: string;
    fireflyKey: string;
    sha256: string;
    pHash: string;
    ipfsHash: string;
    ipfsLink: string;
    txId?: string;
    imageId?: number;
    derivedFrom?: {
      _id: string;
      artistName: string;
    };
    requireRoyalty?: boolean;
    likeCount?: number;
    originalArtist?: string;
    artistName: string;
    org:string;
    createdAt: string;
  }
  
  export interface Notification {
    createdAt: string | number | Date;
    message: string;
    read: boolean;
  }