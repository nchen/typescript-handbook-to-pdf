import path from 'path';
import fs from 'fs';
import execa from 'execa';
import mpdf from 'markdown-pdf';
import createGithubClient, { GithubClient } from './github';
import createFiles, { Files } from './files';
import makePdf from './pdf';

const fileNames = `basic-types.md
variable-declarations.md
interfaces.md
classes.md
functions.md
generics.md
enums.md
type-inference.md
type-compatibility.md
advanced-types.md
symbols.md
iterators-and-generators.md
modules.md
namespaces.md
namespaces-and-modules.md
module-resolution.md
declaration-merging.md
jsx.md
decorators.md
mixins.md
triple-slash-directives.md
type-checking-javascript-files.md`.split("\n");

function getIndex(fname: string): number {
    let f = fname.split("/").pop() !;
    f = f.split(" ").join("-").toLowerCase();
    return fileNames.indexOf(f);
}

(async () => {
    const cwd = process.cwd();
    const githubClient: GithubClient = createGithubClient(execa);
    const files: Files = createFiles(fs);
    const { log } = console;

    log('Cloning handbook repo...');
    const clonedRepoDir: string = 
        await githubClient.clone('Microsoft/TypeScript-Handbook', path.join(cwd, 'temp'));
    log('Done');
    let markdownFiles: string[] = files.findMarkdown(path.join(clonedRepoDir, 'pages'));
    markdownFiles = markdownFiles.sort(function(a: string, b: string) : number {
        let ia = getIndex(a);
        let ib = getIndex(b);

        if (ia > ib) return 1;
        if (ia < ib) return -1;
        return 0;
    });

    markdownFiles = markdownFiles.filter(value => getIndex(value) > -1);

    log('Creating pdf...');
    await makePdf(mpdf().concat, markdownFiles, path.join(cwd, 'handbook.pdf'));
    log('Done');
})();
