export class Resource {
    constructor(emoji, singular, plural) {
        this.emoji = emoji
        this.singular = singular
        this.plural = plural
    };

    static function getAll() {
        return [
            new Resource('🍄', 'shroom', 'shrooms'),
            new Resource('🍖', 'meat', 'meat'),
            new Resource('', 'shroom', 'shrooms'),
            new Resource('🍄', 'shroom', 'shrooms'),
        ]
    }
}