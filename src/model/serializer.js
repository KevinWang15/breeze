// [id, start, end, extra]

class HighlightSerializer {
    serialize(items) {
        return items.map(this.serializeItem)
    }

    serializeItem(item) {
        const url = window.location.href;
        return ({
            url,
            id: item[5].id,
            data: {
                x: item[0],
                y: item[1],
                e: {
                    color: item[5].color
                }
            }
        });
    }


    deserialize(items) {
        let i = 0;
        return items.map(item => ([
            item.x,
            item.y,
            i++,
            "breeze-rangy-highlight",
            null,
            {
                id: item.id,
                color: item.e.color
            }
        ]))
    }
}

export default new HighlightSerializer();