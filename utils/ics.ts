// iCalendar (RFC 5545) の生成。
//
// 購読URLとして配るため、以下は仕様どおりに守る必要がある。
//   - 改行は CRLF
//   - 1行75オクテットで折り返す(継続行は先頭に空白)。UTF-8の途中で切ってはいけない
//   - TEXT値は \ ; , と改行をエスケープする
//   - UIDは配信元で一意かつ不変。SEQUENCE と組で「同じ予定の更新」を表す

export type IcsEvent = {
  /** 配信元で一意かつ不変な識別子 */
  uid: string;
  /** 更新回数。上げると購読側が「予定が変わった」と判断する */
  sequence: number;
  summary: string;
  description?: string;
  /** 開始日時(UTC) */
  start: Date;
  /** 終了日時(UTC)。終日イベントでは使わない */
  end?: Date;
  /** 時刻未定。true なら終日イベントとして出す */
  allDay: boolean;
  status: 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED';
};

export type IcsCalendar = {
  /** カレンダー名。購読時に表示される */
  name: string;
  description?: string;
  events: IcsEvent[];
  /** 購読側に希望する取得間隔(分)。Googleは無視するがApple等は参照する */
  refreshIntervalMinutes?: number;
};

const CRLF = '\r\n';

/** TEXT値のエスケープ。順序が重要で、バックスラッシュを最初に処理する */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * 1行75オクテットで折り返す。
 * 日本語を含むためオクテット数で数える必要があるが、UTF-8の多バイト文字の
 * 途中で切ると壊れるので、文字単位で積みながらバイト数を見る。
 */
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;

  const parts: string[] = [];
  let current = '';
  let bytes = 0;
  // 継続行は先頭の空白1文字を含めて75オクテットに収める
  let limit = 75;

  for (const char of line) {
    const size = encoder.encode(char).length;
    if (bytes + size > limit) {
      parts.push(current);
      current = char;
      bytes = size;
      limit = 74;
    } else {
      current += char;
      bytes += size;
    }
  }
  parts.push(current);

  return parts.join(`${CRLF} `);
}

/** 20261010T113000Z 形式 */
function formatDateTime(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** 20261010 形式（終日イベント用） */
function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function buildCalendar(calendar: IcsCalendar, now = new Date()): string {
  const stamp = formatDateTime(now);
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Football Calendar//JA//EN',
    'CALSCALE:GREGORIAN',
    // 購読(片方向配信)であることを示す
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(calendar.name)}`,
    'X-WR-TIMEZONE:Asia/Tokyo',
  ];

  if (calendar.description) {
    lines.push(`X-WR-CALDESC:${escapeText(calendar.description)}`);
  }

  if (calendar.refreshIntervalMinutes) {
    const duration = `PT${calendar.refreshIntervalMinutes}M`;
    lines.push(`REFRESH-INTERVAL;VALUE=DURATION:${duration}`);
    lines.push(`X-PUBLISHED-TTL:${duration}`);
  }

  for (const event of calendar.events) {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${event.uid}`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`SEQUENCE:${event.sequence}`);

    if (event.allDay) {
      // 終日イベントの DTEND は排他的なので翌日を指定する
      lines.push(`DTSTART;VALUE=DATE:${formatDate(event.start)}`);
      lines.push(`DTEND;VALUE=DATE:${formatDate(addDays(event.start, 1))}`);
    } else {
      lines.push(`DTSTART:${formatDateTime(event.start)}`);
      if (event.end) lines.push(`DTEND:${formatDateTime(event.end)}`);
    }

    lines.push(`SUMMARY:${escapeText(event.summary)}`);
    if (event.description) {
      lines.push(`DESCRIPTION:${escapeText(event.description)}`);
    }
    lines.push(`STATUS:${event.status}`);
    lines.push('TRANSP:TRANSPARENT');
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  return lines.map(foldLine).join(CRLF) + CRLF;
}
