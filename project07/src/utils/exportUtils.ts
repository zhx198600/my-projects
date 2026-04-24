import { Script, Episode, Scene, Character, DialogueLine } from '../types';

const HR_THICK = '==============================================================================';
const HR_THIN = '------------------------------------------------------------------------------';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function centerText(text: string, width: number = 78): string {
  const padding = Math.max(0, width - text.length);
  const leftPad = Math.floor(padding / 2);
  const rightPad = Math.ceil(padding / 2);
  return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
}

function formatScene(scene: Scene): string {
  let result = '';
  result += `地点：${scene.location}\n`;
  result += `时间：${scene.time}\n`;
  if (scene.atmosphere) {
    result += `氛围：${scene.atmosphere}\n`;
  }
  if (scene.description) {
    result += `\n场景描述：${scene.description}\n`;
  }
  return result;
}

function formatCharacters(characters: Character[]): string {
  if (!characters.length) return '';

  const lines = characters.map(
    (char) => `• ${char.name} - ${char.description}`
  );
  return lines.join('\n');
}

function formatDialogues(dialogues: DialogueLine[]): string {
  if (!dialogues.length) return '';

  const lines = dialogues.map((dlg) => {
    const emotion = dlg.emotion ? `（${dlg.emotion}）` : '';
    return `${dlg.characterName}${emotion}：${dlg.content}`;
  });
  return lines.join('\n');
}

function formatEpisode(episode: Episode): string {
  let result = '';

  const twistPrefix = episode.isTwist ? '【反转集】' : '';
  const titleLine = `${twistPrefix}第${episode.episodeNumber}集：${episode.title}`;

  result += `${HR_THIN}\n`;
  result += centerText(titleLine) + '\n';
  result += `${HR_THIN}\n\n`;

  if (episode.isTwist && episode.twistHint) {
    result += '【反转提示】\n';
    result += `${episode.twistHint}\n\n`;
  }

  if (episode.scenes.length > 0) {
    result += '【场景】\n';
    for (const scene of episode.scenes) {
      result += `${formatScene(scene)}\n`;
    }
  }

  if (episode.characters.length > 0) {
    result += '【角色】\n';
    result += `${formatCharacters(episode.characters)}\n\n`;
  }

  if (episode.dialogues.length > 0) {
    result += '【对话】\n';
    result += `${formatDialogues(episode.dialogues)}\n\n`;
  }

  if (episode.summary) {
    result += '【本集小结】\n';
    result += `${episode.summary}\n`;
  }

  return result;
}

export function formatScriptForExport(script: Script): string {
  let result = '';

  result += `${HR_THICK}\n`;
  result += centerText(`《${script.title}》`) + '\n';
  result += centerText(`${script.genre} · ${script.totalEpisodes}集短剧`) + '\n';
  result += `${HR_THICK}\n\n`;

  result += '【用户创意】\n';
  result += `${script.userInput}\n\n`;

  for (const episode of script.episodes) {
    result += `${formatEpisode(episode)}\n`;
  }

  result += `${HR_THICK}\n`;
  result += '【剧本信息】\n';
  result += `题材：${script.genre}\n`;
  result += `集数：${script.totalEpisodes}集\n`;
  result += `反转类型：${script.twistType}\n`;
  result += `生成时间：${formatDate(script.createdAt)}\n`;
  result += `${HR_THICK}\n`;

  return result;
}

export function exportScriptAsTxt(script: Script): void {
  const formattedText = formatScriptForExport(script);
  const blob = new Blob([formattedText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const dateStr = formatDate(script.createdAt);
  const safeTitle = script.title.replace(/[<>:"/\\|?*]/g, '_');
  const fileName = `${safeTitle}_${dateStr}.txt`;

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export async function copyScriptToClipboard(script: Script): Promise<boolean> {
  const formattedText = formatScriptForExport(script);

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(formattedText);
      return true;
    }
  } catch {
    // fallback to execCommand
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = formattedText;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    return successful;
  } catch {
    return false;
  }
}
