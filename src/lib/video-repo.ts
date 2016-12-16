import { VideoData } from 'scany';

import { VideoRecord, VideoStatus } from './models';
import { logger } from '../utils/logger';
import { LevelWrapper } from '../utils/level-wrapper';

const log = logger('video-repo');

export class VideoRepository {

  private _db: LevelWrapper;

  constructor(options: { db: LevelWrapper }) {
    this._db = options.db;
  }

  public async getOrAddVideo(video: VideoData): Promise<VideoRecord> {
    let item = await this._db.get<VideoRecord>(video.id);
    
    if (!item) {
      item = {
        id: video.id,
        data: video,
        status: VideoStatus.New
      };
    } else {
      // Update the video data (views, ratings, description, etc. may have changed)
      item.data = video;
    }
    
    await this._db.put(item.id, item);

    return item;
  }

  public async markAsQueued(record: VideoRecord): Promise<VideoRecord> {
    record = await this._db.get<VideoRecord>(record.id);
    record.status = VideoStatus.Queued;
    await this._db.put(record.id, record);

    return record;
  }

  public async markAsDownloaded(record: VideoRecord): Promise<VideoRecord> {
    record = await this._db.get<VideoRecord>(record.id);
    record.status = VideoStatus.Downloaded;
    await this._db.put(record.id, record);

    return record;
  }
}