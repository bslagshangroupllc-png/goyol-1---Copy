import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CollectionPage from './pages/CollectionPage';
import { products, categories, collectionProducts } from './data/mockData';
import type { Product, Category, CategoryId } from './types';
import { I18nProvider, useTranslation } from './context/i18n';


export type Page = 'home' | 'category' | 'product' | 'collection';

const AppContent: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryId | null>(null);
    const [selectedCategoryParent, setSelectedCategoryParent] = useState<CategoryId | null>(null);
    const [navigationHistory, setNavigationHistory] = useState<Array<{ page: Page; productId: number | null; categoryId: CategoryId | null; categoryParent: CategoryId | null }>>([{ page: 'home', productId: null, categoryId: null, categoryParent: null }]);
    const { t } = useTranslation();

    // Listen for browser back/forward buttons
    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            const state = event.state;
            if (state) {
                setCurrentPage(state.page);
                setSelectedProductId(state.productId);
                setSelectedCategoryId(state.categoryId);
                setSelectedCategoryParent(state.categoryParent);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const handleNavigate = (page: Page, contextId?: CategoryId | number | string) => {
        window.scrollTo(0, 0);
        let newProductId = null;
        let newCategoryId: CategoryId | null = null;
        let newCategoryParent: CategoryId | null = null;

        if (page === 'category' && typeof contextId === 'string') {
            // support composite context like "men:sweaters" to keep parent info
            if (contextId.includes(':')) {
                const [parent, sub] = contextId.split(':');
                newCategoryParent = parent as CategoryId;
                newCategoryId = sub as CategoryId;
            } else {
                newCategoryParent = null;
                newCategoryId = contextId as CategoryId;
            }
        } else if (page === 'product' && typeof contextId === 'number') {
            newProductId = contextId;
            // Keep the previous page context (category or collection) when viewing product
            // so that returning to product detail will remember where we came from
        } else if (page === 'collection') {
            // collection page doesn't have context parameters
        }

        setCurrentPage(page);
        setSelectedProductId(newProductId);
        setSelectedCategoryId(newCategoryId);
        setSelectedCategoryParent(newCategoryParent);

        // Push state to browser history
        const state = {
            page,
            productId: newProductId,
            categoryId: newCategoryId,
            categoryParent: newCategoryParent,
        };
        window.history.pushState(state, '', window.location.href);
    };

    const handleViewProduct = (productId: number) => {
        handleNavigate('product', productId);
    };

    const handleGoBack = () => {
        window.history.back();
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'product':
                const product = products.find(p => p.id === selectedProductId);
                if (!product) {
                    return <HomePage products={products} onViewProduct={handleViewProduct} onNavigate={handleNavigate} />;
                }
                const relatedProducts = products
                    .filter(p => p.category === product.category && p.id !== product.id)
                    .slice(0, 4);

                return <ProductDetailPage 
                    product={product} 
                    relatedProducts={relatedProducts}
                    onViewProduct={handleViewProduct}
                    onBack={handleGoBack}
                />;

            case 'category':
                if (selectedCategoryId) {
                    const categoryInfo = categories[selectedCategoryId];
                    if (!categoryInfo) {
                        return <HomePage products={products} onViewProduct={handleViewProduct} onNavigate={handleNavigate} />;
                    }

                    const parentCategoryName = (id: CategoryId | null) => {
                        switch (id) {
                            case 'men': return 'Men';
                            case 'women': return 'Women';
                            case 'accessories': return 'Accessories';
                            default: return '';
                        }
                    };

                    const subcategoryName = (id: CategoryId | null) => {
                        switch (id) {
                            case 'sweaters': return 'Sweaters';
                            case 'scarves': return 'Scarves';
                            case 'hats': return 'Hats';
                            case 'gloves': return 'Gloves';
                            case 'socks': return 'Socks';
                            case 'cardigan': return 'Cardigans';
                            case 'dress': return 'Dresses';
                            case 'vest': return 'Vests';
                            case 'bottoms': return 'Bottoms';
                            case 'coat': return 'Coats';
                            default: return '';
                        }
                    };

                    const categoryProducts = products.filter(p => {
                        // if a parent is set alongside a subcategory, filter by both
                        if (selectedCategoryParent && selectedCategoryId && selectedCategoryParent !== selectedCategoryId) {
                            const parentName = parentCategoryName(selectedCategoryParent);
                            const subName = subcategoryName(selectedCategoryId);
                            if (parentName && subName) return p.category === parentName && p.subcategory === subName;
                        }

                        switch (selectedCategoryId) {
                            case 'men': return p.category === 'Men';
                            case 'women': return p.category === 'Women';
                            case 'accessories': return p.category === 'Accessories';
                            case 'sweaters': return p.subcategory === 'Sweaters';
                            case 'scarves': return p.subcategory === 'Scarves';
                            case 'hats': return p.subcategory === 'Hats';
                            case 'gloves': return p.subcategory === 'Gloves';
                            case 'socks': return p.subcategory === 'Socks';
                            case 'couple': return p.event === 'couple';
                            case 'christmas': return p.event === 'christmas';
                            case 'company': return p.event === 'company';
                            case 'cardigan': return p.subcategory === 'Cardigans';
                            case 'dress': return p.subcategory === 'Dresses';
                            case 'vest': return p.subcategory === 'Vests';
                            case 'bottoms': return p.subcategory === 'Bottoms';
                            case 'coat': return p.subcategory === 'Coats';
                            default: return false;
                        }
                    });
                    
                    const category: Category = {
                        ...categoryInfo,
                        name: t(categoryInfo.name)
                    };

                    return <CategoryPage 
                        category={category} 
                        products={categoryProducts} 
                        onViewProduct={handleViewProduct}
                        onBack={handleGoBack}
                    />;
                }
                 return <HomePage products={products} onViewProduct={handleViewProduct} onNavigate={handleNavigate} />;
            
            case 'collection':
                return <CollectionPage products={collectionProducts} onViewProduct={handleViewProduct} onBack={handleGoBack} />;

            case 'home':
            default:
                return <HomePage products={products} onViewProduct={handleViewProduct} onNavigate={handleNavigate} />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header onNavigate={handleNavigate} />
            <div className="flex-grow">
                {renderPage()}
            </div>
            <Footer />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <I18nProvider>
            <AppContent />
        </I18nProvider>
    );
};


export default App;