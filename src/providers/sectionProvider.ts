import * as vscode from 'vscode';
import * as path from 'path';

interface SectionInfo {
    title: string;
    level: number;
    line: number;
    file: string;
    wordCount: number;
    children: SectionInfo[];
}

export class SectionTreeProvider implements vscode.TreeDataProvider<SectionItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<SectionItem | undefined | null | void> = new vscode.EventEmitter<SectionItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<SectionItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private sections: SectionInfo[] = [];

    refresh(): void {
        this.parseSections();
        this._onDidChangeTreeData.fire();
    }

    private parseSections(): void {
        this.sections = [];
        const editor = vscode.window.activeTextEditor;
        if (!editor || !editor.document.fileName.endsWith('.tex')) {
            return;
        }

        const document = editor.document;
        const text = document.getText();
        const lines = text.split('\n');
        
        const sectionRegex = /\\(section|subsection|subsubsection|chapter|part)\{([^}]+)\}/;
        const levelMap: { [key: string]: number } = {
            'part': 0,
            'chapter': 1,
            'section': 2,
            'subsection': 3,
            'subsubsection': 4
        };

        let currentSection: SectionInfo | null = null;
        let sectionStartLine = 0;
        let sectionContent = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const match = line.match(sectionRegex);
            
            if (match) {
                // Save previous section word count
                if (currentSection) {
                    currentSection.wordCount = this.countWords(sectionContent);
                }

                const level = levelMap[match[1]] || 2;
                const title = match[2];
                
                currentSection = {
                    title,
                    level,
                    line: i,
                    file: document.fileName,
                    wordCount: 0,
                    children: []
                };
                
                this.sections.push(currentSection);
                sectionStartLine = i;
                sectionContent = '';
            } else if (currentSection) {
                sectionContent += line + ' ';
            }
        }

        // Count words for last section
        if (currentSection) {
            currentSection.wordCount = this.countWords(sectionContent);
        }
    }

    private countWords(text: string): number {
        // Remove LaTeX commands
        const cleanText = text
            .replace(/\\[a-zA-Z]+\{[^}]*\}/g, '')
            .replace(/\\[a-zA-Z]+/g, '')
            .replace(/[{}\\$%&_^~#]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        
        return cleanText.split(/\s+/).filter(word => word.length > 0).length;
    }

    getTreeItem(element: SectionItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: SectionItem): Thenable<SectionItem[]> {
        if (!element) {
            return Promise.resolve(
                this.sections.map(s => new SectionItem(s, vscode.TreeItemCollapsibleState.None))
            );
        }
        return Promise.resolve([]);
    }
}

class SectionItem extends vscode.TreeItem {
    constructor(
        public readonly section: SectionInfo,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(section.title, collapsibleState);
        
        const indent = '  '.repeat(section.level);
        const levelIcon = ['📖', '📚', '§', '•', '◦'][section.level] || '•';
        
        this.label = `${levelIcon} ${section.title}`;
        this.description = `${section.wordCount} words`;
        this.tooltip = `${section.title}\nLine ${section.line + 1}\n${section.wordCount} words`;
        
        this.command = {
            command: 'latexHelper.goToSection',
            title: 'Go to Section',
            arguments: [{ location: { file: section.file, line: section.line } }]
        };
        
        this.contextValue = 'section';
    }
}
