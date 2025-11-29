import * as vscode from 'vscode';

export class TemplateInserter {
    async insertFigure() {
        const label = await vscode.window.showInputBox({ prompt: 'Figure label (e.g., fig:myimage)', value: 'fig:' });
        if (!label) return;
        
        const caption = await vscode.window.showInputBox({ prompt: 'Figure caption' });
        if (!caption) return;

        const template = `\\begin{figure}[htbp]
    \\centering
    \\includegraphics[width=0.8\\textwidth]{figures/image.png}
    \\caption{${caption}}
    \\label{${label}}
\\end{figure}`;

        this.insertText(template);
    }

    async insertTable() {
        const label = await vscode.window.showInputBox({ prompt: 'Table label (e.g., tab:mytable)', value: 'tab:' });
        if (!label) return;

        const caption = await vscode.window.showInputBox({ prompt: 'Table caption' });
        if (!caption) return;

        const cols = await vscode.window.showInputBox({ prompt: 'Number of columns', value: '3' });
        const numCols = parseInt(cols || '3');

        const colSpec = 'l' + 'c'.repeat(numCols - 1);
        const headers = Array(numCols).fill('Header').map((h, i) => `${h} ${i + 1}`).join(' & ');
        const row = Array(numCols).fill('Data').join(' & ');

        const template = `\\begin{table}[htbp]
    \\centering
    \\caption{${caption}}
    \\label{${label}}
    \\begin{tabular}{${colSpec}}
        \\toprule
        ${headers} \\\\
        \\midrule
        ${row} \\\\
        ${row} \\\\
        \\bottomrule
    \\end{tabular}
\\end{table}`;

        this.insertText(template);
    }

    async insertSection() {
        const level = await vscode.window.showQuickPick(
            ['section', 'subsection', 'subsubsection'],
            { placeHolder: 'Select section level' }
        );
        if (!level) return;

        const title = await vscode.window.showInputBox({ prompt: 'Section title' });
        if (!title) return;

        const label = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const template = `\\${level}{${title}}\\label{sec:${label}}\n`;

        this.insertText(template);
    }

    async insertTemplate() {
        const templates = [
            { label: 'Abstract', description: 'Thesis abstract template' },
            { label: 'Introduction', description: 'Introduction section with subsections' },
            { label: 'Methodology', description: 'Research methodology template' },
            { label: 'Results', description: 'Results and discussion template' },
            { label: 'Conclusion', description: 'Conclusion section template' },
            { label: 'Algorithm', description: 'Algorithm environment' },
            { label: 'Equation', description: 'Equation environment' },
            { label: 'Itemize', description: 'Bullet list' },
            { label: 'Enumerate', description: 'Numbered list' }
        ];

        const selected = await vscode.window.showQuickPick(templates, { placeHolder: 'Select template to insert' });
        if (!selected) return;

        const templateContent = this.getTemplateContent(selected.label);
        this.insertText(templateContent);
    }

    private getTemplateContent(name: string): string {
        const templates: { [key: string]: string } = {
            'Abstract': `\\begin{abstract}
Your abstract text here. Summarize the key points of your research including:
\\begin{itemize}
    \\item Research objectives
    \\item Methodology
    \\item Key findings
    \\item Conclusions
\\end{itemize}
\\end{abstract}`,
            'Introduction': `\\section{Introduction}\\label{sec:introduction}

\\subsection{Background of the Study}
Provide context and background information here.

\\subsection{Statement of the Problem}
Clearly state the research problem.

\\subsection{Objectives of the Study}
\\begin{enumerate}
    \\item General objective
    \\item Specific objective 1
    \\item Specific objective 2
\\end{enumerate}

\\subsection{Significance of the Study}
Explain the importance and potential impact of this research.`,
            'Methodology': `\\section{Methodology}\\label{sec:methodology}

\\subsection{Research Design}
Describe the overall research approach.

\\subsection{Data Collection}
Explain how data will be collected.

\\subsection{Data Analysis}
Describe the analysis methods to be used.

\\subsection{Experimental Setup}
Detail the experimental configuration and parameters.`,
            'Results': `\\section{Results and Discussion}\\label{sec:results}

\\subsection{Experimental Results}
Present your findings here.

% Add your results table
\\begin{table}[htbp]
    \\centering
    \\caption{Experimental Results}
    \\label{tab:results}
    \\begin{tabular}{lcc}
        \\toprule
        Method & Accuracy & Time (ms) \\\\
        \\midrule
        Baseline & 0.85 & 100 \\\\
        Proposed & 0.92 & 80 \\\\
        \\bottomrule
    \\end{tabular}
\\end{table}

\\subsection{Discussion}
Analyze and interpret your results.`,
            'Conclusion': `\\section{Conclusion}\\label{sec:conclusion}

Summarize the key findings and contributions of this research.

\\subsection{Summary of Findings}
Recap the main results.

\\subsection{Recommendations}
Provide recommendations based on findings.

\\subsection{Future Work}
Suggest directions for future research.`,
            'Algorithm': `\\begin{algorithm}
\\caption{Algorithm Name}
\\label{alg:myalgorithm}
\\begin{algorithmic}[1]
    \\STATE Initialize variables
    \\FOR{each iteration}
        \\STATE Process data
        \\IF{condition}
            \\STATE Action A
        \\ELSE
            \\STATE Action B
        \\ENDIF
    \\ENDFOR
    \\RETURN result
\\end{algorithmic}
\\end{algorithm}`,
            'Equation': `\\begin{equation}
    f(x) = \\sum_{i=1}^{n} x_i^2
    \\label{eq:myequation}
\\end{equation}`,
            'Itemize': `\\begin{itemize}
    \\item First item
    \\item Second item
    \\item Third item
\\end{itemize}`,
            'Enumerate': `\\begin{enumerate}
    \\item First item
    \\item Second item
    \\item Third item
\\end{enumerate}`
        };

        return templates[name] || '';
    }

    private insertText(text: string) {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, text);
            });
        }
    }
}
