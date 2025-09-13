
interface IScore {
    lines: number,
    points: number,
    date: Date
}

/**
 * Keep track of recent scores
 */
export default class ScoreTable {
    scores: IScore[] = []

    add(lines: number, points: number): void {
        this.scores.unshift({
            lines,
            points,
            date: new Date()
        });
        console.log('Newest score: ', this.scores[0]);
    }

    getNewest(): IScore | undefined {
        if (this.scores.length > 0) {
            return this.scores[0];
        }
    }
}
