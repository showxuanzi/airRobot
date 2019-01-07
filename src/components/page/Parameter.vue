<template>
    <div class="table">
        <div class="container">
            <div class="handle-box">
                <el-button type="primary" icon="delete" class="handle-del mr10" @click="delAll">批量删除</el-button>
                <el-button type="primary" @click="add">添加</el-button>
               <!--  <el-select v-model="select_cate" placeholder="筛选省份" class="handle-select mr10">
                    <el-option key="1" label="广东省" value="广东省"></el-option>
                    <el-option key="2" label="湖南省" value="湖南省"></el-option>
                </el-select> -->
                <el-input v-model="select_word" placeholder="筛选关键词" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="search" @click="search">搜索</el-button>
            </div>
            <el-table :data="data" border class="table" ref="multipleTable" @selection-change="handleSelectionChange">
                <el-table-column type="selection" align="center" width="80"></el-table-column>
                <el-table-column prop="site" label="站点" align="center"></el-table-column>
                <el-table-column prop="pm25" label="PM2.5" align="center"></el-table-column>
                <el-table-column prop="pm10" label="PM10" align="center"></el-table-column>
                <el-table-column prop="so2" label="二氧化硫" align="center"></el-table-column>
                <el-table-column prop="no2" label="二氧化氮" align="center"></el-table-column>
                <el-table-column prop="co" label="一氧化碳" align="center"></el-table-column>
                <el-table-column prop="o3" label="臭氧" align="center"></el-table-column>
                <el-table-column prop="main" label="主要污染物" align="center"></el-table-column>
                <el-table-column prop="complex" label="空气质量综合指数" align="center"></el-table-column>
                <el-table-column label="操作" align="center" width="180">
                    <template slot-scope="scope">
                        <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                        <el-button type="text" icon="el-icon-delete" class="red" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination background @current-change="handleCurrentChange" layout="prev, pager, next" :total="1000">
                </el-pagination>
            </div>
        </div>

        <!-- 编辑弹出框 -->
        <el-dialog :title="dialogTitle" :visible.sync="editVisible" width="670px">
            <el-form ref="form" :model="form" label-width="50px" class="demo-form-inline" :inline="true">
                <!-- <el-form-item label="日期">
                    <el-date-picker type="date" placeholder="选择日期" v-model="form.date" value-format="yyyy-MM-dd" style="width: 100%;"></el-date-picker>
                </el-form-item> -->
                <el-form-item label="站点" class="my-label">
                    <el-input v-model="form.site"></el-input>
                </el-form-item>
                <el-form-item label="PM2.5">
                    <el-input v-model="form.pm25"></el-input>
                </el-form-item>
                <el-form-item label="PM10">
                    <el-input v-model="form.pm10"></el-input>
                </el-form-item>
                <el-form-item label="二氧化硫">
                    <el-input v-model="form.so2"></el-input>
                </el-form-item>
                <el-form-item label="二氧化氮">
                    <el-input v-model="form.no2"></el-input>
                </el-form-item>
                <el-form-item label="一氧化碳">
                    <el-input v-model="form.co"></el-input>
                </el-form-item>
                <el-form-item label="臭氧">
                    <el-input v-model="form.o3"></el-input>
                </el-form-item>
                <el-form-item label="主要污染物">
                    <el-input v-model="form.main"></el-input>
                </el-form-item> 
                <el-form-item label="综合指数">
                    <el-input v-model="form.complex"></el-input>
                </el-form-item>

            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 删除提示框 -->
        <el-dialog title="提示" :visible.sync="delVisible" width="300px" center>
            <div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="delVisible = false">取 消</el-button>
                <el-button type="primary" @click="deleteRow">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: 'basetable',
        data() {
            return {
                url: './static/vuetable.json',
                tableData: [],
                cur_page: 1,
                multipleSelection: [],
                select_cate: '',
                select_word: '',
                del_list: [],
                is_search: false,
                editVisible: false,
                delVisible: false,
                form: {
                    id: '',
                    site: '',
                    pm25: '',
                    pm10: '',
                    so2: '',
                    no2: '',
                    co: '',
                    o3: '',
                    main: '',
                    complex: ''
                },
                idx: -1,
                dialogTitle:"添加"
            }
        },
        created() {
            this.getData();
        },
        computed: {
            data() {
                return this.tableData.filter((d) => {
                    let is_del = false;
                    for (let i = 0; i < this.del_list.length; i++) {
                        if (d.id === this.del_list[i].id) {
                            is_del = true;
                            break;
                        }
                    }
                    if (!is_del) {
                        if (d.site.indexOf(this.select_cate) > -1 &&
                            (d.id.indexOf(this.select_word) > -1 ||
                                d.site.indexOf(this.select_word) > -1)
                        ) {
                            return d;
                        }
                    }
                })
            }
        },
        methods: {
            // 分页导航
            handleCurrentChange(val) {
                this.cur_page = val;
                this.getData();
            },
            // 获取 easy-mock 的模拟数据
            getData() {
                // 开发环境使用 easy-mock 数据，正式环境使用 json 文件
                if (process.env.NODE_ENV === 'development') {
                    this.url = 'https://www.easy-mock.com/mock/5bfe3a97009a932767a6367a/table/parameter';
                    // this.url = '/ms/example/xmx';
                };
                this.$axios.post(this.url, {
                    page: this.cur_page,
                },{
                    // headers:{
                    //     "X-Request-With": "XMLHttpRequest",
                    //     "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
                    // }
                }).then((res) => {
                    this.tableData = res.data.list;
                })
            },
            search() {
                this.is_search = true;
            },
            formatter(row, column) {
                return row.address;
            },
            filterTag(value, row) {
                return row.tag === value;
            },
            handleEdit(index, row) {
                this.idx = index;
                const item = this.tableData[index];
                this.form = {
                    name: item.name,
                    address: item.address,
                    num: item.num,
                    phone: item.phone
                }
                this.editVisible = true;
                this.dialogTitle = "编辑";
            },
            handleDelete(index, row) {
                this.idx = index;
                this.delVisible = true;
            },
            delAll() {
                const length = this.multipleSelection.length;
                let str = '';
                this.del_list = this.del_list.concat(this.multipleSelection);
                for (let i = 0; i < length; i++) {
                    str += this.multipleSelection[i].name + ' ';
                }
                this.$message.error('删除了' + str);
                this.multipleSelection = [];
            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            // 保存编辑
            saveEdit() {
                this.$set(this.tableData, this.idx, this.form);
                this.editVisible = false;
                this.$message.success(`修改第 ${this.idx+1} 行成功`);
            },
            // 确定删除
            deleteRow(){
                this.tableData.splice(this.idx, 1);
                this.$message.success('删除成功');
                this.delVisible = false;
            },
            // 添加
            add(){
                this.editVisible = true;
                this.dialogTitle = "添加";
            }
        }
    }

</script>
<style type="text/css">
    .el-form-item__label{
        width: 100px!important;
    }
</style>
<style scoped>
    .handle-box {
        margin-bottom: 20px;
    }

    .handle-select {
        width: 120px;
    }

    .handle-input {
        width: 300px;
        display: inline-block;
    }
    .del-dialog-cnt{
        font-size: 16px;
        text-align: center
    }
    .table{
        width: 100%;
        font-size: 14px;
    }
    .red{
        color: #ff0000;
    }
</style>
