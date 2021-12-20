import {
  BaseSource,
  Candidate,
} from "https://deno.land/x/ddc_vim@v0.13.0/types.ts#^";

type Params = {
  hoge?: string;
};

export class Source extends BaseSource<Params> {
  async gatherCandidates(): Promise<Candidate[]> {
    const histories = await this.getHistory();
    return this.allWords(histories).filter((word) => word.length < 50).map((
      word,
    ) => ({ word }));
  }

  params(): Params {
    return {};
  }

  private async runCmd(cmd: string[]): Promise<string[]> {
    const p = Deno.run({ cmd, stdout: "piped" });
    const [_, out] = await Promise.all([p.status(), p.output()]);
    p.close();
    return new TextDecoder().decode(out).split(/\n/);
  }

  private async getHistory(): Promise<string[]> {
    const lines = await this.runCmd([
      Deno.env.get("SHELL") || "sh",
      "-c",
      "history",
    ]);
    return lines.map((line) => line.replace(/^\d+\s+/, ""));
  }

  private allWords(lines: string[]): string[] {
    const words = lines
      .flatMap((line) => [...line.matchAll(/[-_\p{L}\d]+/gu)])
      .map((match) => match[0]);
    return Array.from(new Set(words)); // remove duplication
  }
}
