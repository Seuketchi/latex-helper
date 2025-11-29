import * as vscode from 'vscode';

interface FigureTableInfo {
    type: 'figure' | 'table';
    label: string;
    caption: string;
    line: number;
    file: string;
}

export class FigureTableProvider implements vscode.TreeDataProvider<FigureTableItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<FigureTableItem | undefined | null | void> = new vscode.EventEmitter<FigureTableItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<FigureTableItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private items: FigureTableInfo[] = [];

    refresh(): void {
        this.parseDocument();
        this._onDidChangeTreeData.fire();
    }

    private parseDocument(): void {
        this.items = [];
        const editor = vscode.window.activeTextEditor;
        if (!editor || !editor.document.fileName.endsWith('.tex')) {
            return;
        }

        const document = editor.document;
        const text = document.getText();
        const lines = text.split('\n');

        // Parse figures and tables
        const envRegex = /\\begin\{(figure|table)\}/;
        const labelRegex = /\\label\{([^}]+)\}/;
        const captionRegex = /\\caption\{([^}]+)\}/;

        let inEnvironment: 'figure' | 'table' | null = null;
        let envStartLine = 0;
        let currentLabel = '';
        let currentCaption = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            const beginMatch = line.match(envRegex);
            if (beginMatch) {
                inEnvironment = beginMatch[1] as 'figure' | 'table';
                envStartLine = i;
                currentLabel = '';
                currentCaption = '';
            }

            if (inEnvironment) {
                const labelMatch = line.match(labelRegex);
                const captionMatch = line.match(captionRegex);
                
                if (labelMatch) currentLabel = labelMatch[1];
                if (captionMatch) currentCaption = captionMatch[1];

                if (line.includes(`\\end{${inEnvironment}}`)) {
                    this.items.push({
                        type: inEnvironment,
                        label: currentLabel || `unlabeled_${inEnvironment}_${envStartLine}`,
                        caption: currentCaption || 'No caption',
                        line: envStartLine,
                        file: document.fileName
                    });
                    inEnvironment = null;
                }
            }
        }
    }

    getTreeItem(element: FigureTableItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: FigureTableItem): Thenable<FigureTableItem[]> {
        if (!element) {
            const figures = this.items.filter(i => i.type === 'figure');
            const tables = this.items.filter(i => i.type === 'table');
            
            const result: FigureTableItem[] = [];
            
            if (figures.length > 0) {
                result.push(new FigureTableItem({
                    type: 'figure',
                    label: `Figures (${figures.length})`,
                    caption: '',
                    line: -1,
                    file: ''
                }, true, figures.map(f => new FigureTableItem(f, false))));
            }
            
            if (tables.length > 0) {
                result.push(new FigureTableItem({
                    type: 'table',
                    label: `Tables (${tables.length})`,
                    caption: '',
                    line: -1,
                    file: ''
                }, true, tables.map(t => new FigureTableItem(t, false))));
            }
            
            return Promise.resolve(result);
        }
        
        return Promise.resolve(element.children || []);
    }
}

class FigureTableItem extends vscode.TreeItem {
    children?: FigureTableItem[];
    
    constructor(
        public readonly info: FigureTableInfo,
        isCategory: boolean,
        children?: FigureTableItem[]
    ) {
        super(
            info.label,
            isCategory ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None
        );
        
        this.children = children;
        
        if (isCategory) {
            this.iconPath = new vscode.ThemeIcon(info.type === 'figure' ? 'file-media' : 'table');
        } else {
            const icon = info.type === 'figure' ? '🖼️' : '📊';
            this.label = `${icon} ${info.label}`;
            this.description = info.caption.substring(0, 40) + (info.caption.length > 40 ? '...' : '');
            this.tooltip = `${info.caption}\nLine ${info.line + 1}`;
            
            this.command = {
                command: 'latexHelper.goToFigure',
                title: 'Go to Figure/Table',
                arguments: [{ location: { file: info.file, line: info.line } }]
            };
        }
        
        this.contextValue = isCategory ? 'category' : info.type;
    }
}
