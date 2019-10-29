'use strict';
const Database = use('Database')


class DatatableController {

    constructor(request, table) {
        this.request = request
        this.table = table
        this.query = Database.from(this.table)
        this.columns = this.request.columns
        this.columnNames = this.getColumnNames();
        this.response = {
            "draw": this.request.draw,
            "recordsTotal": 0,
            "recordsFiltered": 0,
            "data": {}
        }
    }

    async make() {
        const that = this;
        // get total query records data
        this.response.data = await this.processData()

        // get total records from database
        await Database.from(this.table).count().first()
            .then(function (item) {
                that.response.recordsTotal = item['count(*)']
            })


        return this.response

    }

    /**
     * 
     * @summary received table instance and fetches data
     * @param {*} table 
     */
    async processData() {
        await this.filter()
        await this.search()
        await this.reOrder()
        let response = await this.query
        this.response.recordsFiltered = response.length
        await this.paginate()
        response = await this.query
        return response
    }

    /**
    *
    * @summary received table instance and applies filtering and conditions on the table
    * @param {*} table
    * @returns table
    */
    async filter() {
        // return this.query.where('id',4)
    }


    async paginate() {
        console.log(this.request)
        return this.query.offset(parseInt(this.request.start))
        .limit(parseInt(this.request.length))
    }

    async search() {
        // this.columns.forEach((element) => {
        //     if (element.searchable == true) {
        //         // this.performColumnSearch(element)
        //     }
        // })

        this.columnNames.forEach((name) => {
            this.query.orWhere(name, 'like', '%' + this.request.search.value + '%');
        });
        // this.getColumnNames();
    }

    async performColumnSearch(element) {
        // console.log('el is', element)
        if (element.search.value != '' || typeof element.search.value != 'undefined') {
            this.query.where(element.data, 'like', '%' + element.search.value + '%')
        }
    }

    async reOrder() {
        this.query.orderBy(this.columnNames[this.request.order[0].column], this.request.order[0].dir)
    }

    getColumnNames() {
        const names = [];
        this.columns.forEach((column) => {
            names.push(column.name)
        })

        return names
    }
}

module.exports = DatatableController;