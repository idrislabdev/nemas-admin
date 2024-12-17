export const formatterNumber = (val:number) => {
    if (!val) return 0;
        return `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".").replace(/\.(?=\d{0,2}$)/g, ",");
}
