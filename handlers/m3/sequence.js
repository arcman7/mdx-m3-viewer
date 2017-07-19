/**
 * @constructor
 * @param {M3ParserSequence} sequence
 */
function M3Sequence(sequence) {
    this.name = sequence.name.getAll().join("");
    this.interval = sequence.interval;
    this.movementSpeed = sequence.movementSpeed;
    this.frequency = sequence.frequency;
    this.boundingSphere = sequence.boundingSphere;
}

export default M3Sequence;
