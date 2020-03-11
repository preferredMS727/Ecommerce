import { from } from 'rxjs';

// Services
export { CustomersService } from './customers.service.fake'; // You have to comment this, when your real back-end is done
// export { CustomersService } from './customers.service'; // You have to uncomment this, when your real back-end is done
export { ProductsService } from './products.service.fake'; // You have to comment this, when your real back-end is done
// export { ProductsService } from './products.service'; // You have to uncomment this, when your real back-end is done
export { ProductRemarksService }
from './product-remarks.service.fake'; // You have to comment this, when your real back-end is done
// export { ProductRemarksService }
// from './product-remarks.service'; // You have to uncomment this, when your real back-end is done
export { ProductSpecificationsService }
from './product-specifications.service.fake'; // You have to comment this, when your real back-end is done
// export { ProductSpecificationsService }
// from './product-specifications.service'; // You have to uncomment this, when your real back-end is done

export { FireProductRemarksService } from './fire-product-remarks.service';
export { FireProductsService } from './fire-products.service';
export { FireOrderService } from './fire-order.service';
export { FireProductSpecificationsService } from './fire-product-specifications.service';
export { FireCustomersService } from './fire-customers.service';