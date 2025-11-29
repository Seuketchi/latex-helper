import * as vscode from 'vscode';

export class StatsViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'latexHelper.stats';
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;
        webviewView.webview.options = { enableScripts: true, localResourceRoots: [this._extensionUri] };
        this.updateStats();
    }

    public refresh() { this.updateStats(); }
    public show() { if (this._view) { this._view.show(true); } }

    private updateStats() {
        if (!this._view) { return; }
        const stats = this.calculateStats();
        this._view.webview.html = this.getHtmlContent(stats);
    }

    private calculateStats(): DocumentStats {
        const editor = vscode.window.activeTextEditor;
        if (!editor || !editor.document.fileName.endsWith('.tex')) {
            return { wordCount: 0, charCount: 0, lineCount: 0, pageCount: 0, citationCount: 0, figureCount: 0, tableCount: 0, sectionCount: 0 };
        }
        const text = editor.document.getText();
        const cleanText = text.replace(/%.*/g, '').replace(/\\[a-zA-Z]+\{[^}]*\}/g, '').replace(/\\[a-zA-Z]+/g, '').replace(/[{}\\$%&_^~#\[\]]/g, '').replace(/\s+/g, ' ').trim();
        const words = cleanText.split(/\s+/).filter(w => w.length > 0);
        return {
            wordCount: words.length,
            charCount: cleanText.length,
            lineCount: editor.document.lineCount,
            pageCount: Math.ceil(words.length / 250),
            citationCount: (text.match(/\\cite\{[^}]+\}/g) || []).length,
            figureCount: (text.match(/\\begin\{figure\}/g) || []).length,
            tableCount: (text.match(/\\begin\{table\}/g) || []).length,
            sectionCount: (text.match(/\\(section|subsection|subsubsection)\{/g) || []).length
        };
    }

    private getHtmlContent(stats: DocumentStats): string {
        return '<!DOCTYPE html><html><head><style>body{font-family:var(--vscode-font-family);padding:10px;}.stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}.stat-item{background:var(--vscode-editor-background);border:1px solid var(--vscode-panel-border);border-radius:4px;padding:8px;text-align:center;}.stat-value{font-size:1.4em;font-weight:bold;color:var(--vscode-textLink-foreground);}.stat-label{font-size:0.85em;color:var(--vscode-descriptionForeground);}</style></head><body><div class="stat-grid"><div class="stat-item"><div class="stat-value">' + stats.wordCount + '</div><div class="stat-label">Words</div></div><div class="stat-item"><div class="stat-value">~' + stats.pageCount + '</div><div class="stat-label">Pages</div></div><div class="stat-item"><div class="stat-value">' + stats.sectionCount + '</div><div class="stat-label">Sections</div></div><div class="stat-item"><div class="stat-value">' + stats.citationCount + '</div><div class="stat-label">Citations</div></div><div class="stat-item"><div class="stat-value">' + stats.figureCount + '</div><div class="stat-label">Figures</div></div><div class="stat-item"><div class="stat-value">' + stats.tableCount + '</div><div class="stat-label">Tables</div></div></div></body></html>';
    }
}

interface DocumentStats { wordCount: number; charCount: number; lineCount: number; pageCount: number; citationCount: number; figureCount: number; tableCount: number; sectionCount: number; }
