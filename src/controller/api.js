const Base = require("./base.js");

module.exports = class extends Base {
  async queryPlansAction() {
    if (this.isGet) {
      // 如果是 GET 请求
      const typeId = this.ctx.param("typeId");
      const data = await this.model("ins_plan_clone").where({ type_id: typeId }).select();
      const final = [];
      data.forEach((item) => {
        final.push({
          id: item.id,
          payer: item.payer,
          productName: item.product_name,
          name: item.name
        });
      });
      return this.success({ plans: final });
    }
  }
  async queryItemsAction() {
    if (this.isGet) {
      let planIds = this.ctx.param("planId");
      if (!Array.isArray(planIds)) {
        planIds = [this.ctx.param("planId")];
      }

      const finalPlans = [];
      const finalItems = [];
      const itemParents = await this.model('ins_plan_item_parent').select();

      for (let x = 0; x < planIds.length; x++) {
        const plan = await this.model('ins_plan_clone').where({ id: planIds[x] }).find();
        finalPlans.push({
          id: plan.id,
          payer: plan.payer,
          productName: plan.product_name,
          name: plan.name
        });
        const items = await this.model('ins_plan_item_clone')
          .where({ plan_id: planIds[x] }).order('seq ASC')
          .select();
        items.forEach((newItem) => {
          let item = {};
          let isNew = true;
          finalItems.forEach((existingItem) => {
            if (existingItem.name === newItem.name) {
              item = existingItem;
              isNew = false;
            }
          });

          if (isNew) {
            item.name = newItem.name;
            item.parentId = newItem.parent_id || null;
            item.values = [{ planIds: [newItem.plan_id], value: newItem.value }];
            finalItems.push(item);
          } else {
            if (Array.isArray(item.values)) {
              let hasValue = false;
              for (let i = 0; i < item.values.length; i++) {
                if (item.values[i].value === newItem.value) {
                  item.values[i].planIds.push(newItem.plan_id);
                  hasValue = true;
                  break;
                }
              }
              if (!hasValue) {
                item.values.push({ planIds: [newItem.plan_id], value: newItem.value });
              }
            }
          }

          if (newItem.merge_item_id) {
            if (item.mergeIds) {
              item.mergeIds[newItem.plan_id] = newItem.merge_item_id;
            } else {
              item.mergeIds = { [newItem.plan_id]: newItem.merge_item_id };
            }
          }
        });
      }
      return this.success({ plans: finalPlans, items: finalItems, itemParents });
    }
  }
};
